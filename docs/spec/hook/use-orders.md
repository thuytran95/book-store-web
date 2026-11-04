# Hook: Orders

APIs used: [../api/orders.md](../api/orders.md)  |  Location: `frontend/src/features/orders/hooks/`

## Hooks
- [x] `usePlaceOrder()` mutation `POST /orders`; invalidate `["cart"]`, `["orders"]`, `["reservations"]`
  - [x] Handles OUT_OF_STOCK (show which book), CART_EMPTY, BOOK_UNAVAILABLE
- [x] `useOrders(page)` query `["orders", page]`
- [x] `useOrder(id)` query `["order", id]`
- [x] `useCancelOrder()` mutation `POST /orders/{id}/cancel`; handles INVALID_TRANSITION

## Forms
- [x] Checkout form: address, payment method, note (Zod)

## Done
- [x] All bullets above complete
