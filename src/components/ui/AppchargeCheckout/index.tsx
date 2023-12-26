import { ReactNode, useEffect } from "react";
import "./button.scss";
import { Stack } from "@mui/material";

export interface AppchargeCheckoutProps {
  playerId: string;
  price: number;
  url: string;
  sessionMetaData?: any;
  width?: string;
  height?: string;
  closeIconColor?: string;
  closeIconRender?: ReactNode;
  onCloseModal?: () => void;
  isOpen?: boolean;
  bootLocation?: string;
  // new props - should delete old one
  domain: string;
  onOpen?: () => void;
  onClose?: () => void;
  onPaymentIntentSuccess?: () => void;
  onPaymentIntentFailed?: () => void;
  onOrderCompletedSucessfuly?: () => void;
  onOrderCompletedFailed?: () => void;
}

enum EventEnum {
  paymentIntentSuccess = "Payment_intent_success",
  paymentIntentFailed = "Payment_intent_failed",
  orderCompletedSucessfuly = "Order_completed_sucessfuly",
  orderCompletedFailed = "Order_completed_failed",
}

// export interface AppchargeCheckoutPropsV2 {}

function AppchargeCheckout({
  playerId,
  price,
  sessionMetaData,
  width = "450px",
  height = "500px",
  url,
  closeIconRender,
  onCloseModal,
  bootLocation,
  isOpen,
  domain,
  onPaymentIntentSuccess,
  onPaymentIntentFailed,
  onOrderCompletedSucessfuly,
  onOrderCompletedFailed,
}: AppchargeCheckoutProps) {
  
  useEffect(() => {
    const eventHandler = (event: MessageEvent) => {
      if (event.origin === domain) return;

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
    onPaymentIntentSuccess,
    onPaymentIntentFailed,
    onOrderCompletedSucessfuly,
    onOrderCompletedFailed,
  ]);

  return (
    <Stack
      position="absolute"
      width="100vw"
      height="100vh"
      bgcolor="rgba(0, 0, 0, 0.5)"
      top={0}
      left={0}
      justifyContent="center"
      alignItems="center"
      zIndex="99999"
      style={{
        zIndex: "999999",
      }}
      display={isOpen ? "flex" : "none"}
    >
      <Stack
        style={{
          borderRadius: "30px",
          border: "4px solid #66A3FF",
          background: "#1C134F",
          boxShadow: "0px 0px 30px 0px #CFFCFF",
          width: width,
          height: height,
        }}
        position="relative"
        justifyContent="center"
        alignItems="center"
      >
        <button style={{ background: "transparent", border: "0" }}>
          {closeIconRender ? (
            closeIconRender
          ) : (
            <div>
              <svg className="svg-icon" viewBox="0 0 20 20">
                <path
                  fill="none"
                  d="M11.469,10l7.08-7.08c0.406-0.406,0.406-1.064,0-1.469c-0.406-0.406-1.063-0.406-1.469,0L10,8.53l-7.081-7.08
							c-0.406-0.406-1.064-0.406-1.469,0c-0.406,0.406-0.406,1.063,0,1.469L8.531,10L1.45,17.081c-0.406,0.406-0.406,1.064,0,1.469
							c0.203,0.203,0.469,0.304,0.735,0.304c0.266,0,0.531-0.101,0.735-0.304L10,11.469l7.08,7.081c0.203,0.203,0.469,0.304,0.735,0.304
							c0.267,0,0.532-0.101,0.735-0.304c0.406-0.406,0.406-1.064,0-1.469L11.469,10z"
                ></path>
              </svg>
            </div>
          )}
        </button>
        <iframe
          src={`${url}/?playerId=${playerId}&price=${price}&sessionMetadata=${
            JSON.stringify(sessionMetaData) || "{}"
          }&bootLocation=${
            bootLocation || window.location.origin.replace("https://", "")
          }`}
          title="checkout"
          style={{
            position: "relative",
            zIndex: 300,
            width: "750px",
            height: "530px",
            border: "0px",
            marginTop: -32,
          }}
        ></iframe>
      </Stack>
    </Stack>
  );
}

export default AppchargeCheckout;
