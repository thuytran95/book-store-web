# Feature: Cart and Checkout

Routes: `/cart`, `/checkout`  |  Role: buyer  |  Prototype: n/a

## Uses
- [ ] Hooks: [../hook/use-cart.md](../hook/use-cart.md), [../hook/use-orders.md](../hook/use-orders.md), [../hook/use-account.md](../hook/use-account.md)
- [ ] Components: [../component/cart-line.md](../component/cart-line.md), [../component/address-picker.md](../component/address-picker.md)

## Pages
- [ ] `(shop)/cart/page.tsx`: lines, quantity, remove, total, checkout button
- [ ] `(shop)/checkout/page.tsx`: address picker or new address, payment method (COD / bank transfer), note, order summary, place order
- [ ] Bank transfer shows `BANK_TRANSFER_INFO` after selection
- [ ] On success redirect to `/orders/[id]` with confirmation

## Behaviour
- [ ] Empty cart state with link to books
- [ ] OUT_OF_STOCK on place order: highlight the affected book, offer to remove it
- [ ] Block checkout when no address
- [ ] Shipping fee display per decision on open question (default: 0 until decided)
- [ ] Responsive: sticky summary on mobile

## Done
- [ ] All bullets above complete
