# Hook: Orders

APIs used: [../api/orders.md](../api/orders.md)  |  Location: `frontend/src/features/orders/hooks/`

## Hooks
- [ ] `usePlaceOrder()` mutation `POST /orders`; invalidate `["cart"]`, `["orders"]`, `["reservations"]`
  - [ ] Handles OUT_OF_STOCK (show which book), CART_EMPTY, BOOK_UNAVAILABLE
- [ ] `useOrders(page)` query `["orders", page]`
- [ ] `useOrder(id)` query `["order", id]`
- [ ] `useCancelOrder()` mutation `POST /orders/{id}/cancel`; handles INVALID_TRANSITION

## Forms
- [ ] Checkout form: address, payment method, note (Zod)

## Done
- [ ] All bullets above complete
