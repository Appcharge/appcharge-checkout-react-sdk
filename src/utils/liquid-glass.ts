/**
 * iOS 26 Safari "Liquid Glass" fix — host viewport meta.
 *
 * The checkout runs as a cross-origin iframe and can't paint outside its own box,
 * so the white band between the iframe and Safari's translucent bottom toolbar must
 * be fixed on the host page. Apple requires `viewport-fit=cover` on the page's
 * viewport meta for content to extend behind the toolbar — there is no iframe-only
 * way to opt in.
 *
 * DEFENSE: the fix is applied ONLY on iOS/iPadOS 26+ (where Liquid Glass exists).
 * On every other platform/version — Android, desktop, older iOS, non-notched
 * devices — `enableLiquidGlassFix()` is a hard no-op and touches nothing.
 *
 * SAFETY CONTRACT (mirrors preconnect.ts): NEVER throws, SSR-safe, idempotent, and
 * returns a restore fn so the publisher page is left pristine once checkout unmounts.
 *
 * Reference: https://1ar.io/updates/safari-26-liquid-glass-web/
 */

const NOOP = (): void => { /* nothing to restore */ };

/**
 * Marker class added to <html> on iOS/iPadOS 26+ only. CSS scoped to this class
 * (see styles.scss) stretches the checkout iframe to the full screen so it covers
 * the area behind the translucent toolbar (otherwise the publisher's page shows
 * through there). Kept in sync with styles.scss.
 */
export const LIQUID_GLASS_CLASS = 'ac-ios26-liquid-glass';

/**
 * True only on iOS / iPadOS 26 or newer. Covers classic iPhone/iPod/iPad user
 * agents ("... OS 26_0 ...") and iPadOS masquerading as macOS ("MacIntel" +
 * touch), where the Safari version ("Version/26") tracks the OS version.
 * Never throws; returns false when detection isn't possible (e.g. SSR).
 */
export function isIos26OrAbove(): boolean {
  try {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';

    const isIphoneOrIpod = /iPhone|iPod/.test(ua);
    const isIpad = /iPad/.test(ua)
      || (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1);
    if (!isIphoneOrIpod && !isIpad) return false;

    // Classic iOS UA carries "... OS 26_0 ...". iPadOS-as-macOS only exposes the
    // Safari version ("Version/26.0"), which is aligned with the OS major version.
    const osMatch = ua.match(/\bOS (\d+)(?:[_.]\d+)*\b/);
    const versionMatch = ua.match(/\bVersion\/(\d+)/);
    const major = osMatch
      ? parseInt(osMatch[1], 10)
      : versionMatch
        ? parseInt(versionMatch[1], 10)
        : 0;

    return Number.isFinite(major) && major >= 26;
  } catch {
    return false;
  }
}

/**
 * Ensure the host page's viewport meta declares `viewport-fit=cover` so content
 * (the full-screen iframe) extends behind the iOS 26 translucent toolbar/safe
 * areas. Idempotent; creates a viewport meta if none exists. Returns a function
 * that restores the original state. This is the low-level, un-gated primitive —
 * prefer `enableLiquidGlassFix()`, which applies it only where it's needed.
 */
export function ensureViewportFitCover(): () => void {
  try {
    if (typeof document === 'undefined' || !document.head) return NOOP;

    // Browsers honor the last viewport meta when several are present.
    const metas = document.head.querySelectorAll('meta[name="viewport"]');
    const meta = metas.length ? (metas[metas.length - 1] as HTMLMetaElement) : null;

    if (!meta) {
      const created = document.createElement('meta');
      created.name = 'viewport';
      created.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
      document.head.appendChild(created);
      return () => { try { created.remove(); } catch { /* noop */ } };
    }

    const original = meta.getAttribute('content') || '';
    if (/viewport-fit\s*=/i.test(original)) return NOOP; // host already opted in

    const next = original.trim().length
      ? `${original.replace(/\s*,\s*$/, '')}, viewport-fit=cover`
      : 'width=device-width, initial-scale=1, viewport-fit=cover';
    meta.setAttribute('content', next);
    return () => { try { meta.setAttribute('content', original); } catch { /* noop */ } };
  } catch {
    return NOOP;
  }
}

/**
 * Add the iOS-26 marker class to <html> (see LIQUID_GLASS_CLASS). Returns a
 * function that removes it again. No-op / never-throws off the happy path.
 */
function markLiquidGlassRoot(): () => void {
  try {
    const html = typeof document !== 'undefined' ? document.documentElement : null;
    if (!html || html.classList.contains(LIQUID_GLASS_CLASS)) return NOOP;
    html.classList.add(LIQUID_GLASS_CLASS);
    return () => { try { html.classList.remove(LIQUID_GLASS_CLASS); } catch { /* noop */ } };
  } catch {
    return NOOP;
  }
}

/**
 * Apply the iOS 26 Safari Liquid Glass fix — but ONLY on iOS/iPadOS 26+. It:
 *   1. opts the host page into `viewport-fit=cover`, and
 *   2. marks <html> so the iframe is stretched full-screen (CSS in styles.scss),
 *      covering the publisher's page behind the translucent toolbar.
 * Returns a cleanup function that reverts every change (a no-op on unaffected
 * platforms), so the publisher page is left exactly as it was once checkout
 * unmounts.
 *
 * @example
 * useEffect(() => enableLiquidGlassFix(), []);
 */
export function enableLiquidGlassFix(): () => void {
  if (!isIos26OrAbove()) return NOOP;
  const restoreViewport = ensureViewportFitCover();
  const restoreClass = markLiquidGlassRoot();
  return () => {
    restoreClass();
    restoreViewport();
  };
}
