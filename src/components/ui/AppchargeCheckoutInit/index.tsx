import './styles.scss';

export interface AppchargeCheckoutInitProps {
  sandbox?: boolean;
  domain?: string;
  checkoutToken: string;
  environment?: 'dev' | 'sandbox' | 'prod';
}

function AppchargeCheckoutInit({
  environment = 'sandbox',
  checkoutToken,
  domain = window.location.host,
}: AppchargeCheckoutInitProps) {
  const env = environment === 'prod' ? '' : `-${environment}`;
  
  if (!checkoutToken) {
      throw Error('checkoutToken prop is missing in AppchargeCheckoutInit component')
  }

  return (
    <iframe
      src={`https://checkout-v2${env}.appcharge.com/handshake?checkout-token=${checkoutToken}`}
      className="iframe-transparent"
      title="checkout-transparent"
    ></iframe>
  );
}

export default AppchargeCheckoutInit;
