import { useEffect } from "react";
import "./styles.scss";

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
  productAmount: string;
  productSKU: string;
  productName: string;
  totalSum: number;
  totalSumCurrency: string;
  userId?: string;
  userCountry?: string;
  paymentMethodName: string;
  reason?: string;
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

enum EventEnum {
  paymentIntentSuccess = "Payment_intent_success",
  paymentIntentFailed = "Payment_intent_failed",
  orderCompletedSuccessfully = "Order_completed_successfully",
  orderCompletedFailed = "Order_completed_failed",
}

// export interface AppchargeCheckoutPropsV2 {}

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
    const eventHandler = (event: MessageEvent) => {
      if (event.origin !== domain) return;
      const params = event.data.params;
      switch (event.data.event) {
        case EventEnum.orderCompletedFailed:
          onOrderCompletedFailed?.(params);
          break;
        case EventEnum.orderCompletedSuccessfully:
          onOrderCompletedSuccessfully?.(params);
          break;
        case EventEnum.paymentIntentFailed:
          onPaymentIntentFailed?.(params);
          break;
        case EventEnum.paymentIntentSuccess:
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
