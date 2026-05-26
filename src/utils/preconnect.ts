/**
 * Inject `<link rel="preconnect">` and `<link rel="dns-prefetch">` for the
 * given origin. Saves DNS lookup + TCP + TLS (~100-500ms).
 *
 * SAFETY CONTRACT: NEVER throws. If anything goes wrong it silently does
 * nothing. Checkout is never blocked or broken by this function.
 *
 * Idempotent — subsequent calls for the same origin are no-ops.
 */
export function preconnectCheckout(checkoutUrl: string): void {
  try {
    if (typeof document === 'undefined' || !document.head || !checkoutUrl) return;

    let origin: string;
    try {
      origin = new URL(checkoutUrl).origin;
    } catch {
      return;
    }

    if (document.querySelector(`link[rel="preconnect"][href="${origin}"]`)) {
      return;
    }

    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = origin;
    preconnect.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect);

    const dnsPrefetch = document.createElement('link');
    dnsPrefetch.rel = 'dns-prefetch';
    dnsPrefetch.href = origin;
    document.head.appendChild(dnsPrefetch);
  } catch {
    // Swallow any unexpected error — preconnect is an opportunistic optimization
    // and must NEVER block or break checkout.
  }
}

let warmupPromise: Promise<void> | null = null;

/**
 * Pre-load the checkout app shell by mounting a hidden iframe to the checkout
 * origin. This downloads and caches all static assets (JS bundles, CSS, fonts,
 * config, payment SDKs like Stripe.js) without needing a session URL.
 *
 * When the real checkout iframe loads later with a session URL, all cached
 * assets are served instantly from the browser HTTP cache — only the session-
 * specific HTML and API call are new.
 *
 * SAFETY CONTRACT:
 * - This is a FIRE-AND-FORGET optimization. You do NOT need to await it.
 * - The returned Promise ALWAYS resolves, NEVER rejects.
 * - If warmup hasn't finished when the player opens checkout, checkout still
 *   opens normally — <AppchargeCheckout /> is fully independent of this
 *   function. It simply won't benefit from the cache-warming.
 * - If anything goes wrong (network error, missing DOM, bad URL), warmup
 *   silently resolves without side-effects.
 *
 * Safe to call multiple times — subsequent calls return the same promise.
 * Also calls `preconnectCheckout` internally.
 *
 * @param checkoutOrigin The checkout origin URL (e.g. 'https://pay.appcharge.com').
 *
 * @example
 * // Fire-and-forget on app init — DO NOT block checkout on this:
 * warmupCheckout('https://pay.appcharge.com');
 */
export function warmupCheckout(checkoutOrigin: string): Promise<void> {
  if (typeof document === 'undefined' || !checkoutOrigin) {
    return Promise.resolve();
  }

  if (warmupPromise) {
    return warmupPromise;
  }

  let origin: string;
  try {
    origin = new URL(checkoutOrigin).origin;
  } catch {
    return Promise.resolve();
  }

  preconnectCheckout(origin);
  PAYMENT_SDK_ORIGINS.forEach(preconnectCheckout);

  warmupPromise = new Promise<void>((resolve) => {
    try {
      if (!document.body) {
        resolve();
        return;
      }

      const iframe = document.createElement('iframe');
      iframe.src = origin;
      iframe.setAttribute('aria-hidden', 'true');
      iframe.tabIndex = -1;
      iframe.style.cssText = 'position:fixed;width:0;height:0;border:0;opacity:0;pointer-events:none;z-index:-1;';

      let settled = false;
      const KEEP_ALIVE_MS = 2500;

      const settle = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        setTimeout(() => {
          try { iframe.remove(); } catch { /* noop */ }
          resolve();
        }, KEEP_ALIVE_MS);
      };

      iframe.onload = settle;
      iframe.onerror = settle;
      const timeoutId = setTimeout(settle, 15_000);

      document.body.appendChild(iframe);
    } catch {
      resolve();
    }
  });

  return warmupPromise;
}

// ---------------------------------------------------------------------------
// Module-level side effect: auto-preconnect to all known payment/API origins
// the moment this module is imported. The consumer gets the perf win just by
// importing the SDK — no extra calls needed.
// ---------------------------------------------------------------------------
const PAYMENT_SDK_ORIGINS = [
  'https://js.stripe.com',
  'https://checkoutshopper-live.adyen.com',
  'https://checkoutshopper-test.adyen.com',
  'https://js.braintreegateway.com',
  'https://assets.braintreegateway.com',
  'https://cdn.safecharge.com',
  'https://secure.safecharge.com',
  'https://api.appcharge.com',
  'https://ext-stg-api.appchargestore.com',
];

try {
  PAYMENT_SDK_ORIGINS.forEach(preconnectCheckout);
} catch { /* never break the import */ }
