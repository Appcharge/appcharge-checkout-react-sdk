import { useEffect, useRef } from 'react';
import './styles.scss';

export interface Product {
  name: string;
  sku: string;
  amount: string | number;
}

interface StoreTheme {
  publisherId: string;
  general: {
    logo: string;
    logoSize: string;
    backgroundImageMobile: string;
    backgroundImageDesktop: string;
    font: string;
    buttonColor: {
      gradientDirection: string;
      colorOne: string;
      colorTwo: string;
    };
    buttonTextColor: string;
    favicon: string;
    bundlesViewModel: string;
    bundlesInternalViewModel: string;
    specialOffersViewModel: string;
    specialOffersInternalViewModel: string;
    productsQuantityFormat: {
      milSeparator: string;
      fractionalSeparator: string;
      thousandShorthand: boolean;
      millionShorthand: boolean;
      billionShorthand: boolean;
    };
    balanceQuantityFormat: {
      milSeparator: string;
      fractionalSeparator: string;
      thousandShorthand: boolean;
      millionShorthand: boolean;
      billionShorthand: boolean;
    };
    numbersOfBundlesToDisplayDesktop: number;
    numbersOfBundlesToDisplayMobile: number;
    bottomStoreContent: any[]; // You may want to replace 'any' with a more specific type
  };
  login: {
    text: string;
    font: string;
    textColor: string;
    textSize: number;
    textWeight: string;
  };
  storeScreen: {
    bundleBorderColor: {
      gradientDirection: string;
      colorOne: string;
      colorTwo: string;
    };
    borderRadius: number;
    noOffersMessageText: string;
    noOffersTitleText: string;
  };
  paymentScreen: {
    headerText: string;
    headerColor: {
      gradientDirection: string;
      colorOne: string;
      colorTwo: string;
    };
    headerSize: number;
    text: string;
    textColor: string;
    textSize: number;
    popupColor: {
      gradientDirection: string;
      colorOne: string;
      colorTwo: string;
    };
    popupBorderColor: {
      gradientDirection: string;
      colorOne: string;
      colorTwo: string;
    };
  };
  loaderScreen: {
    headerText: string;
    headerColor: {
      gradientDirection: string;
      colorOne: string;
      colorTwo: string;
    };
    headerSize: number;
    text: string;
    textColor: string;
    textSize: number;
    headerWeight: string;
    textWeight: string;
  };
  completedScreen: {
    headerText: string;
    headerColor: {
      gradientDirection: string;
      colorOne: string;
      colorTwo: string;
    };
    headerSize: number;
    text: string;
    textColor: string;
    textSize: number;
    backToStoreText: string;
    headerWeight: string;
    textWeight: string;
    backToGameButtonText: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Integration {
  playersAuthentication: {
    usernamePasswordOn: boolean;
    userTokenOn: boolean;
    googleAppId: string;
    googleOn: boolean;
    appleAppId: string;
    appleOn: boolean;
    userTokenText: string;
    userTokenUrl: string;
    fbAppId: string;
    fbOn: boolean;
    otpLinks: any[]; // You may want to replace 'any' with a more specific type
    appleResponseType: string;
  };
  deepLinks: {
    platform: string;
    deepLink: string;
  }[];
  googleAnalyticsMeasurementId: string;
  logRocketPublisherId: string;
  logRocketAppId: string;
  shouldUseLogRocket: boolean;
  supportUrl: string;
  backToGameButtonOn: boolean;
  backToStoreButtonOn: boolean;
}

interface Publisher {
  termsAndConditionsUrl: string;
  privacyPolicyUrl: string;
  supportMail: string;
  storeTabName: string;
}

interface ExternalServicesConfig {
  mixpanelActive: boolean;
  gaActive: boolean;
  logRocketActive: boolean;
}

interface SupportConfiguration {
  externalSupportUrl: string;
  supportModel: string;
  preLoginSnippet: string;
  postLoginSnippet: string;
}

export interface Boot {
  storeTheme: StoreTheme;
  integration: Integration;
  publisher: Publisher;
  externalServicesConfig: ExternalServicesConfig;
  featureFlags: Record<string, any>; // You may want to replace 'any' with a more specific type
  supportConfiguration: SupportConfiguration;
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

export interface AppchargeCheckoutProps {
  checkoutUrl: string;
  sessionToken: string;
  referrerUrl: string;
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
  checkoutUrl,
  sessionToken,
  onClose,
  onOpen,
  onInitialLoad,
  onOrderCreated,
  onPaymentIntentFailed,
  onPaymentIntentSuccess,
  onOrderCompletedFailed,
  onOrderCompletedSuccessfully,
}: AppchargeCheckoutProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const sendIframeMessage = (iframe: HTMLIFrameElement, message: FEMessage) => {
    iframe.contentWindow?.postMessage(message, checkoutUrl);
  };

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
          onClose?.();
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

  const url = `${checkoutUrl}/${sessionToken}`; // https://checkout-v2.appcharge.com

  return (
    <iframe
      src={url}
      className="iframe"
      title="checkout"
      allow="payment *"
      ref={iframeRef}
      onLoad={() => {
        iframeRef.current &&
          sendIframeMessage(iframeRef.current, {
            event: EFEEvent.APPCHARGE_THEME,
            params: localStorage.getItem('ac_co_theme'),
          });
        onInitialLoad?.();
      }}
    ></iframe>
  );
}

export default AppchargeCheckout;
