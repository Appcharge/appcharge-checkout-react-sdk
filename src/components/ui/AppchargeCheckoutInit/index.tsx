import { useEffect } from 'react';
import './styles.scss';

export interface AppchargeCheckoutInitProps {
  sandbox?: boolean;
  domain?: string;
  environment?: 'dev' | 'sandbox' | 'prod';
}

const APPCHARGE_CHECKOUT_THEME = 'ac_co_theme';

function AppchargeCheckoutInit({
  environment = 'sandbox',
  domain = window.location.host,
}: AppchargeCheckoutInitProps) {
  const env = environment === 'prod' ? '' : `-${environment}`;

  useEffect(() => {
    fetch(`https://api${env}.appcharge.com/checkout/v1/${domain}/boot`)
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem(
          APPCHARGE_CHECKOUT_THEME,
          JSON.stringify({theme: data.theme, pks: data.pks})
        );
      })
      .catch((err) => {
        localStorage.removeItem(APPCHARGE_CHECKOUT_THEME);
      });
  }, [domain, env]);

  return (
    <iframe
      src={`https://checkout-v2${env}.appcharge.com/handshake`}
      className="iframe-transparent"
      title="checkout-transparent"
    ></iframe>
  );
}

export default AppchargeCheckoutInit;
