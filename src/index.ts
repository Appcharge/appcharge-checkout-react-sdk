// Side-effect import: triggers auto-preconnect to all payment SDK origins
// the moment the SDK is imported. Bare imports are NEVER tree-shaken by
// bundlers (webpack/rollup/vite all preserve them by spec).
import './utils/preconnect';

export { default as AppchargeCheckout } from './components/ui/AppchargeCheckout';
export type {
  AppchargeCheckoutProps,
  EventParams,
  Product,
  Mode,
  CheckoutStyle,
  Customization,
} from './components/ui/AppchargeCheckout';
export { EFEEvent } from './components/ui/AppchargeCheckout';
export { getPricePoints } from './utils/price-points-util';
export { preconnectCheckout, warmupCheckout } from './utils/preconnect';
