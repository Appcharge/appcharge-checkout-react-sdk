## Appcharge's Checkout Solution

Welcome to Appcharge's Checkout Solution, get up and running in a few easy steps.

To install, run this code:

`npm i appcharge-checkout`

The easiest way to get started is by using this code snippet:

```ts
<AppchargeCheckout
  url='http://checkout.yourdomain.com'
  priceInCents={price}
  sessionMetadata={payload}
  isOpen={isModalOpen}
/>
```

`AppchargeCheckout` component can recieve the following props:

| Prop              | Type      | Mandatory |
| ----------------- | --------- | --------- |
| `playerId`        | string    | **Yes**   |
| `priceInCents`    | number    | **Yes**   |
| `url`             | string    | **Yes**   |
| `isOpen`          | boolean   | **Yes**   |
| `sessionMetaData` | any       | No        |
| `width`           | string    | No        |
| `height`          | string    | No        |
| `closeIconColor`  | string    | No        |
| `closeIconRender` | ReactNode | No        |
| `onCloseModal`    | Function  | No        |
