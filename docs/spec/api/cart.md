# API: Cart

Base path: `/api/v1/cart`  |  Models: [../model/cart.md](../model/cart.md)

## Module files
- [x] `app/modules/cart/router.py`, `service.py`, `schemas.py`

## Endpoints
- [x] `GET /cart` | buyer | returns CartRead with available qty per line and total
- [x] `PUT /cart/items/{book_id}` | buyer | body: quantity (0 removes) | errors: BOOK_UNAVAILABLE, OUT_OF_STOCK
- [x] `DELETE /cart/items/{book_id}` | buyer
- [x] `DELETE /cart` | buyer | clear

## Rules
- [x] Cart is created lazily on first use
- [x] Validates against `inventory.available` for display but does not allocate

## Done
- [x] All bullets above complete
