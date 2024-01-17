import { useEffect } from 'react';
import './styles.scss';

export interface AppchargeCheckoutInitProps {
  publisherToken: string;
  sandbox?: boolean;
  domain?: string;
  environment?: 'dev' | 'sandbox' | 'production';
}

const APPCHARGE_CHECKOUT_THEME = 'ac_co_theme';

function AppchargeCheckoutInit({
  publisherToken,
  environment = 'sandbox',
  domain = window.location.host,
}: AppchargeCheckoutInitProps) {
  const env = environment === 'production' ? '' : `-${environment}`;

  useEffect(() => {
    fetch(`https://api${env}.appcharge.com/checkout/v1/${domain}/boot`)
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem(
          APPCHARGE_CHECKOUT_THEME,
          JSON.stringify(data.theme)
        );
      })
      .catch((err) => {
        localStorage.removeItem(APPCHARGE_CHECKOUT_THEME);
      });
  }, [publisherToken]);

  return (
    <iframe
      src={`https://checkout-v2${env}.appcharge.com/handshake`}
      className="iframe-transparent"
      title="checkout-transparent"
    ></iframe>
  );
}

export default AppchargeCheckoutInit;
