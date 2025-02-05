import { useEffect } from 'react';
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
}

interface FEMessage {
  event: EFEEvent;
  params: any;
}

export type Mode = 'mobile-sdk'

export interface AppchargeCheckoutProps {
  checkoutUrl: string;
  sessionToken: string;
  referrerUrl: string;
  sourceVersion?: string;
  checkoutToken: string;
  locale?: string;
  playerId?: string;
  mode?: Mode;
  onOpen?: () => void;
  onClose?: (params: Partial<EventParams>) => void;
  onInitialLoad?: () => void;
  onOrderCreated?: (params: Partial<EventParams>) => void;
  onPaymentIntentFailed?: (params: Partial<EventParams>) => void;
  onOrderCompletedFailed?: (params: Partial<EventParams>) => void;
  onPaymentIntentSuccess?: (params: Partial<EventParams>) => void;
  onOrderCompletedSuccessfully?: (params: Partial<EventParams>) => void;
}

function AppchargeCheckout({
  checkoutUrl,
  playerId,
  sessionToken,
  sourceVersion,
  checkoutToken,
  locale,
  mode,
  onClose,
  onOpen,
  onInitialLoad,
  onOrderCreated,
  onPaymentIntentFailed,
  onPaymentIntentSuccess,
  onOrderCompletedFailed,
  onOrderCompletedSuccessfully,
}: AppchargeCheckoutProps) {
  useEffect(() => {
    const eventHandler = (massageEvent: MessageEvent<FEMessage>) => {
      if (massageEvent.origin !== checkoutUrl) return;
      const { params, event } = massageEvent.data;
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
        case EFEEvent.CLOSE_CHECKOUT:
          onClose?.(params);
          break;
        case EFEEvent.CHECKOUT_OPENED:
          onOpen?.();
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
    onPaymentIntentFailed,
    onPaymentIntentSuccess,
    onOrderCompletedFailed,
    onOrderCompletedSuccessfully,
  ]);

  if (!checkoutToken) {
    throw Error('checkoutToken prop is missing in AppchargeCheckout component');
  }

  const sdkVersion = 'process.env.sdkVersion';
  const queryParams = `sdk-version=react-${sdkVersion}&source-version=${
    sourceVersion || ''
  }&checkout-token=${checkoutToken}${locale ? `&locale=${locale}` : ''}${
    playerId ? `&player_id=${playerId}` : ''
  }${mode ? `&mode=${mode}` : ''}`;

  const url = `${checkoutUrl}/${sessionToken}?${queryParams}`;

  return (
    <iframe
      src={url}
      className="iframe"
      title="checkout"
      allow="payment *"
      onLoad={() => onInitialLoad?.()}
    ></iframe>
  );
}

export default AppchargeCheckout;
