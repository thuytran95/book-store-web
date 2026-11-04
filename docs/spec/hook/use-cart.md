# Hook: Cart

APIs used: [../api/cart.md](../api/cart.md)  |  Location: `frontend/src/features/cart/hooks/`

## Hooks
- [x] `useCart()` returns `{ items, total, count, setQty, remove, clear, isLoading }`
  - [x] Query key `["cart"]`, endpoint `GET /cart`
  - [x] `setQty` mutation `PUT /cart/items/{book_id}` with optimistic update
  - [x] Roll back and toast on OUT_OF_STOCK / BOOK_UNAVAILABLE
  - [x] `remove` mutation `DELETE /cart/items/{book_id}`
- [x] `useAddToCart()` for book detail/card buttons
- [x] Cart count for header badge (guest sees 0, redirect to login on add)

## Done
- [x] All bullets above complete
