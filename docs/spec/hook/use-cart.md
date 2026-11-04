# Hook: Cart

APIs used: [../api/cart.md](../api/cart.md)  |  Location: `frontend/src/features/cart/hooks/`

## Hooks
- [ ] `useCart()` returns `{ items, total, count, setQty, remove, clear, isLoading }`
  - [ ] Query key `["cart"]`, endpoint `GET /cart`
  - [ ] `setQty` mutation `PUT /cart/items/{book_id}` with optimistic update
  - [ ] Roll back and toast on OUT_OF_STOCK / BOOK_UNAVAILABLE
  - [ ] `remove` mutation `DELETE /cart/items/{book_id}`
- [ ] `useAddToCart()` for book detail/card buttons
- [ ] Cart count for header badge (guest sees 0, redirect to login on add)

## Done
- [ ] All bullets above complete
