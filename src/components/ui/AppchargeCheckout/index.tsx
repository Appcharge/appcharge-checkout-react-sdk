import { useEffect, useRef } from 'react';
import { preconnectCheckout } from '../../../utils/preconnect';
import './styles.scss';

export interface Product {
  name: string;
  sku: string;
  amount: string | number;
}

export interface EventParams {
  orderId: string;
  orderExternalId: string;
  date: string;
  sessionId: string;
  purchaseInvoiceId: string;
  appChargePaymentId: string;
  bundleName: string;
  bundleId: string;
  bundleSKU: string;
  products: Product[];
  totalSum: number;
  totalSumCurrency: string;
  paymentMethodName: string;
  userId?: string;
  userCountry?: string;
  reason?: string;
}

export enum EFEEvent {
  ORDER_CREATED = 'appcharge_order_created',
  PAYMENT_INTENT_SUCCESS = 'appcharge_payment_intent_success',
  PAYMENT_INTENT_FAILED = 'appcharge_payment_intent_failed',
  ORDER_COMPLETED_SUCCESS = 'appcharge_order_completed_success',
  ORDER_COMPLETED_FAILED = 'appcharge_order_completed_failed',
  CLOSE_CHECKOUT = 'appcharge_close_checkout',
  CHECKOUT_OPENED = 'appcharge_checkout_opened',
  APPCHARGE_THEME = 'appcharge_theme',
  ON_PAYMENT_INTENT = 'appcharge_on_payment_intent',
}

interface FEMessage {
  event: EFEEvent;
  params: any;
}

export type Mode = 'mobile-sdk'

export type CheckoutStyle = {
  overlayBackgroundColor?: string;
}

export type Customization = {
  expandProductList?: boolean;
}

export interface AppchargeCheckoutProps {
  checkoutUrl: string;
  referrerUrl: string;
  sourceVersion?: string;
  locale?: string;
  playerId?: string;
  mode?: Mode;
  checkoutStyle?: CheckoutStyle;
  customization?: Customization;
  /**
   * Controls iframe visibility. When `false`, the iframe is rendered and
   * loaded in the background (hidden + non-interactive) so the checkout is
   * ready to show instantly when flipped to `true`. The buffered
   * `onOpen` event (if any) fires once `visible` becomes `true`.
   *
   * Defaults to `true` (existing behavior — iframe is shown on mount).
   */
  visible?: boolean;
  onOpen?: () => void;
  onClose?: (params: Partial<EventParams>) => void;
  onInitialLoad?: () => void;
  onOrderCreated?: (params: Partial<EventParams>) => void;
  onPaymentIntent?: (params: Partial<EventParams>) => void;
  onPaymentIntentFailed?: (params: Partial<EventParams>) => void;
  onOrderCompletedFailed?: (params: Partial<EventParams>) => void;
  onPaymentIntentSuccess?: (params: Partial<EventParams>) => void;
  onOrderCompletedSuccessfully?: (params: Partial<EventParams>) => void;
}

function AppchargeCheckout({
  checkoutUrl,
  playerId,
  sourceVersion,
  locale,
  mode,
  checkoutStyle,
  customization,
  visible = true,
  onClose,
  onOpen,
  onInitialLoad,
  onOrderCreated,
  onPaymentIntent,
  onPaymentIntentFailed,
  onPaymentIntentSuccess,
  onOrderCompletedFailed,
  onOrderCompletedSuccessfully,
}: AppchargeCheckoutProps) {
  const visibleRef = useRef(visible);
  const pendingOpenRef = useRef(false);

  // Preconnect to the checkout origin on mount. Payment SDK origins (Stripe,
  // Adyen, Braintree, Nuvei) are already preconnected at SDK import time via
  // the module-level side effect in preconnect.ts.
  useEffect(() => {
    try { preconnectCheckout(checkoutUrl); } catch { /* never break checkout */ }
  }, [checkoutUrl]);

  useEffect(() => {
    visibleRef.current = visible;
    if (visible && pendingOpenRef.current) {
      pendingOpenRef.current = false;
      onOpen?.();
    }
  }, [visible, onOpen]);

  useEffect(() => {
    const eventHandler = (massageEvent: MessageEvent<FEMessage>) => {
      const checkoutBaseUrl = getCheckoutBaseUrl(checkoutUrl);
      if (massageEvent.origin !== checkoutBaseUrl) return;
      const { params, event } = massageEvent.data;
      if (!event) return;
      switch (event) {
        case EFEEvent.ORDER_CREATED:
          onOrderCreated?.(params);
          break;
        case EFEEvent.ORDER_COMPLETED_FAILED:
          onOrderCompletedFailed?.(params);
          break;
        case EFEEvent.ORDER_COMPLETED_SUCCESS:
          onOrderCompletedSuccessfully?.(params);
          break;
        case EFEEvent.PAYMENT_INTENT_FAILED:
          onPaymentIntentFailed?.(params);
          break;
        case EFEEvent.PAYMENT_INTENT_SUCCESS:
          onPaymentIntentSuccess?.(params);
          break;
        case EFEEvent.ON_PAYMENT_INTENT:
          onPaymentIntent?.(params);
          break;
        case EFEEvent.CLOSE_CHECKOUT:
          onClose?.(params);
          break;
        case EFEEvent.CHECKOUT_OPENED:
          if (visibleRef.current) {
            onOpen?.();
          } else {
            pendingOpenRef.current = true;
          }
          break;
      }
    };

    window.addEventListener('message', eventHandler);

    return () => {
      window.removeEventListener('message', eventHandler);
    };
  }, [
    checkoutUrl,
    onOrderCreated,
    onPaymentIntent,
    onPaymentIntentFailed,
    onPaymentIntentSuccess,
    onOrderCompletedFailed,
    onOrderCompletedSuccessfully,
  ]);

  const sdkVersion = 'process.env.sdkVersion';
  const checkoutUrlWithParams = buildURLWithQueryParams(checkoutUrl, {
    sdkVersion,
    sourceVersion,
    locale,
    playerId,
    mode,
    checkoutStyle,
    customization,
  });

  return (
    <iframe
      src={checkoutUrlWithParams}
      className={visible ? 'iframe' : 'iframe iframe--hidden'}
      title="checkout"
      allow="payment *"
      onLoad={() => onInitialLoad?.()}
    ></iframe>
  );
}

function getCheckoutBaseUrl(checkoutUrl: string) {
  const { origin } = new URL(checkoutUrl);
  return origin;
}

interface CheckoutURLQueryParams {
  sdkVersion: string;
  sourceVersion?: string;
  locale?: string;
  playerId?: string;
  mode?: Mode;
  checkoutStyle?: CheckoutStyle;
  customization?: Customization;
}

function buildURLWithQueryParams(checkoutUrl: string, params: CheckoutURLQueryParams): string {
  const url = new URL(checkoutUrl);

  // Required params
  url.searchParams.set('sdk-version', `react-${params.sdkVersion}`);

  // Optional params
  if (params.sourceVersion) {
    url.searchParams.set('source-version', params.sourceVersion);
  }
  if (params.locale) {
    url.searchParams.set('locale', params.locale);
  }
  if (params.playerId) {
    url.searchParams.set('player_id', params.playerId);
  }
  if (params.mode) {
    url.searchParams.set('mode', params.mode);
  }
  if (params.checkoutStyle?.overlayBackgroundColor) {
    url.searchParams.set('overlay-background-color', params.checkoutStyle.overlayBackgroundColor);
  }
  if (params.customization) {
    try {
      url.searchParams.set('customization', JSON.stringify(params.customization));
    } catch {
      // Silently fail if customization cannot be stringified
    }
  }

  return url.toString();
}

export default AppchargeCheckout;
