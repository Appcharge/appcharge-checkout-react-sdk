## Appcharge's Checkout Solution

Welcome to Appcharge's Checkout Solution, get up and running in a few easy steps.

### Installation
To install, run this code:
`npm i appcharge-checkout-react-sdk`

### Import
In your React component, import the AppchargeCheckout component:

```ts
import { AppchargeCheckout } from "appcharge-checkout-react-sdk";
```

The easiest way to get started is by using this code snippet:

```ts
<AppchargeCheckout
  domain={'http://checkout.yourdomain.com'}
  sessionToken={sessionToken}
/>
```


### Props
`AppchargeCheckout` component can recieve the following props:

| Prop                        | Type      | Mandatory |
| ----------------------------| --------- | --------- |
| `domain`                    | string    | **Yes**   |
| `sessionToken`              | string    | **Yes**   |
| `onInitialLoad`             | Function  | No        |
| `onPaymentIntentFailed`     | Function  | No        |
| `onPaymentIntentSuccess`    | Function  | No        |
| `onOrderCompletedFailed`    | Function  | No        |
| `onOrderCompletedSucessfuly`| Function  | No        |
