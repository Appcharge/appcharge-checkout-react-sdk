import { useEffect } from "react";
import "./styles.scss";

export interface AppchargeCheckoutProps {
  domain: string;
  sessionToken: string;
  onOpen?: () => void;
  onClose?: () => void;
  onInitialLoad?: () => void;
  onPaymentIntentFailed?: () => void;
  onOrderCompletedFailed?: () => void;
  onPaymentIntentSuccess?: () => void;
  onOrderCompletedSucessfuly?: () => void;
}

enum EventEnum {
  paymentIntentSuccess = "Payment_intent_success",
  paymentIntentFailed = "Payment_intent_failed",
  orderCompletedSucessfuly = "Order_completed_sucessfuly",
  orderCompletedFailed = "Order_completed_failed",
}

// export interface AppchargeCheckoutPropsV2 {}

function AppchargeCheckout({
  domain,
  sessionToken,
  onInitialLoad,
  onPaymentIntentFailed,
  onPaymentIntentSuccess,
  onOrderCompletedFailed,
  onOrderCompletedSucessfuly,
}: AppchargeCheckoutProps) {

  useEffect(() => {
    const eventHandler = (event: MessageEvent) => {
      if (event.origin !== domain) return;
      switch (event.data) {
        case EventEnum.orderCompletedFailed:
          onOrderCompletedFailed?.();
          break;
        case EventEnum.orderCompletedSucessfuly:
          onOrderCompletedSucessfuly?.();
          break;
        case EventEnum.paymentIntentFailed:
          onPaymentIntentFailed?.();
          break;
        case EventEnum.paymentIntentSuccess:
          onPaymentIntentSuccess?.();
          break;
      }
    };

    window.addEventListener("message", eventHandler);

    return () => {
      window.removeEventListener("message", eventHandler);
    };
  }, [
    onPaymentIntentFailed,
    onPaymentIntentSuccess,
    onOrderCompletedFailed,
    onOrderCompletedSucessfuly,
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
