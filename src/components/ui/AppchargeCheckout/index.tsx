import { useEffect } from "react";
import "./styles.scss";

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
}

interface FEMessage {
  name: EFEEvent;
  params: any;
}

export interface AppchargeCheckoutProps {
  domain: string;
  sessionToken: string;
  refferlUrl: string;
  onOpen?: () => void;
  onClose?: () => void;
  onInitialLoad?: () => void;
  onOrderCreated?: (params: Partial<EventParams>) => void;
  onPaymentIntentFailed?: (params: Partial<EventParams>) => void;
  onOrderCompletedFailed?: (params: Partial<EventParams>) => void;
  onPaymentIntentSuccess?: (params: Partial<EventParams>) => void;
  onOrderCompletedSuccessfully?: (params: Partial<EventParams>) => void;
}

function AppchargeCheckout({
  domain,
  sessionToken,
  onInitialLoad,
  onOrderCreated,
  onPaymentIntentFailed,
  onPaymentIntentSuccess,
  onOrderCompletedFailed,
  onOrderCompletedSuccessfully,
}: AppchargeCheckoutProps) {

  useEffect(() => {
    const eventHandler = (event: MessageEvent<FEMessage>) => {
      if (event.origin !== domain) return;
      const params = event.data.params;
      switch (event.data.name) {
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
      }
    };

    window.addEventListener("message", eventHandler);

    return () => {
      window.removeEventListener("message", eventHandler);
    };
  }, [
    onOrderCreated,
    onPaymentIntentFailed,
    onPaymentIntentSuccess,
    onOrderCompletedFailed,
    onOrderCompletedSuccessfully,
  ]);
  
  const url = `${domain}/${sessionToken}`; // https://checkout-v2.appcharge.com

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
