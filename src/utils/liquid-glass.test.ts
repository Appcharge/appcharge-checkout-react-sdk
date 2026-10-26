/**
 * @jest-environment jsdom
 */
import {
  ensureViewportFitCover,
  enableLiquidGlassFix,
  isIos26OrAbove,
  LIQUID_GLASS_CLASS,
} from './liquid-glass';

function viewportMetas(): HTMLMetaElement[] {
  return Array.from(
    document.head.querySelectorAll('meta[name="viewport"]')
  ) as HTMLMetaElement[];
}

function mockNavigator(opts: {
  userAgent: string;
  platform?: string;
  maxTouchPoints?: number;
}): void {
  Object.defineProperty(window.navigator, 'userAgent', {
    value: opts.userAgent,
    configurable: true,
  });
  Object.defineProperty(window.navigator, 'platform', {
    value: opts.platform ?? '',
    configurable: true,
  });
  Object.defineProperty(window.navigator, 'maxTouchPoints', {
    value: opts.maxTouchPoints ?? 0,
    configurable: true,
  });
}

const UA = {
  iphone26:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1',
  iphone18:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
  ipadOs26AsMac:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15',
  androidChrome:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  desktopSafari:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15',
};

beforeEach(() => {
  document.head.innerHTML = '';
  document.documentElement.classList.remove(LIQUID_GLASS_CLASS);
});

describe('isIos26OrAbove', () => {
  it('is true for iPhone iOS 26', () => {
    mockNavigator({ userAgent: UA.iphone26 });
    expect(isIos26OrAbove()).toBe(true);
  });

  it('is true for iPadOS 26 masquerading as macOS (MacIntel + touch)', () => {
    mockNavigator({ userAgent: UA.ipadOs26AsMac, platform: 'MacIntel', maxTouchPoints: 5 });
    expect(isIos26OrAbove()).toBe(true);
  });

  it('is false for iPhone iOS 18', () => {
    mockNavigator({ userAgent: UA.iphone18 });
    expect(isIos26OrAbove()).toBe(false);
  });

  it('is false for Android Chrome', () => {
    mockNavigator({ userAgent: UA.androidChrome });
    expect(isIos26OrAbove()).toBe(false);
  });

  it('is false for desktop Safari (MacIntel without touch)', () => {
    mockNavigator({ userAgent: UA.desktopSafari, platform: 'MacIntel', maxTouchPoints: 0 });
    expect(isIos26OrAbove()).toBe(false);
  });
});

describe('enableLiquidGlassFix', () => {
  it('injects viewport-fit=cover + marks <html> on iOS 26 and reverts on cleanup', () => {
    mockNavigator({ userAgent: UA.iphone26 });

    const restore = enableLiquidGlassFix();
    expect(viewportMetas()).toHaveLength(1);
    expect(viewportMetas()[0].getAttribute('content')).toContain('viewport-fit=cover');
    expect(document.documentElement.classList.contains(LIQUID_GLASS_CLASS)).toBe(true);

    restore();
    expect(viewportMetas()).toHaveLength(0);
    expect(document.documentElement.classList.contains(LIQUID_GLASS_CLASS)).toBe(false);
  });

  it('is a hard no-op on iOS < 26', () => {
    mockNavigator({ userAgent: UA.iphone18 });
    const restore = enableLiquidGlassFix();
    expect(viewportMetas()).toHaveLength(0);
    expect(document.documentElement.classList.contains(LIQUID_GLASS_CLASS)).toBe(false);
    restore();
    expect(viewportMetas()).toHaveLength(0);
  });

  it('is a hard no-op on Android', () => {
    mockNavigator({ userAgent: UA.androidChrome });
    enableLiquidGlassFix();
    expect(viewportMetas()).toHaveLength(0);
    expect(document.documentElement.classList.contains(LIQUID_GLASS_CLASS)).toBe(false);
  });
});

describe('ensureViewportFitCover', () => {
  it('creates a viewport meta with viewport-fit=cover when none exists', () => {
    const restore = ensureViewportFitCover();

    const metas = viewportMetas();
    expect(metas).toHaveLength(1);
    expect(metas[0].getAttribute('content')).toBe(
      'width=device-width, initial-scale=1, viewport-fit=cover'
    );

    restore();
    expect(viewportMetas()).toHaveLength(0);
  });

  it('appends viewport-fit=cover to an existing viewport meta and restores it', () => {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1';
    document.head.appendChild(meta);

    const restore = ensureViewportFitCover();
    expect(meta.getAttribute('content')).toBe(
      'width=device-width, initial-scale=1, viewport-fit=cover'
    );

    restore();
    expect(meta.getAttribute('content')).toBe('width=device-width, initial-scale=1');
  });

  it('does not double a trailing comma', () => {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, ';
    document.head.appendChild(meta);

    ensureViewportFitCover();
    expect(meta.getAttribute('content')).toBe(
      'width=device-width, initial-scale=1, viewport-fit=cover'
    );
  });

  it('is a no-op when the host already set a viewport-fit value', () => {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, viewport-fit=contain';
    document.head.appendChild(meta);

    const restore = ensureViewportFitCover();
    expect(meta.getAttribute('content')).toBe('width=device-width, viewport-fit=contain');
    restore();
    expect(meta.getAttribute('content')).toBe('width=device-width, viewport-fit=contain');
  });

  it('modifies only the last viewport meta when several exist', () => {
    const first = document.createElement('meta');
    first.name = 'viewport';
    first.content = 'width=device-width';
    document.head.appendChild(first);

    const last = document.createElement('meta');
    last.name = 'viewport';
    last.content = 'initial-scale=1';
    document.head.appendChild(last);

    ensureViewportFitCover();
    expect(first.getAttribute('content')).toBe('width=device-width');
    expect(last.getAttribute('content')).toBe('initial-scale=1, viewport-fit=cover');
  });
});
