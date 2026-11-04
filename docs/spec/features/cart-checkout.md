# Feature: Cart and Checkout

Routes: `/cart`, `/checkout`  |  Role: buyer  |  Prototype: n/a

## Uses
- [x] Hooks: [../hook/use-cart.md](../hook/use-cart.md), [../hook/use-orders.md](../hook/use-orders.md), [../hook/use-account.md](../hook/use-account.md)
- [x] Components: [../component/cart-line.md](../component/cart-line.md), [../component/address-picker.md](../component/address-picker.md)

## Pages
- [x] `(shop)/cart/page.tsx`: lines, quantity, remove, total, checkout button
- [x] `(shop)/checkout/page.tsx`: address picker or new address, payment method (COD / bank transfer), note, order summary, place order
- [x] Bank transfer shows `BANK_TRANSFER_INFO` after selection
- [x] On success redirect to `/orders/[id]` with confirmation

## Behaviour
- [x] Empty cart state with link to books
- [x] OUT_OF_STOCK on place order: highlight the affected book, offer to remove it
- [x] Block checkout when no address
- [x] Shipping fee display per decision on open question (default: 0 until decided)
- [x] Responsive: sticky summary on mobile

## Done
- [x] All bullets above complete
