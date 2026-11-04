# Model: Cart, CartItem

Source: plan section 2 (carts, cart_items)  |  Prototype: n/a

## Purpose
- [x] One persistent cart per user

## Database
- [x] Table `carts`: id, user_id FK unique, timestamps
- [x] Table `cart_items`: cart_id FK, book_id FK, quantity (>= 1), PK (cart_id, book_id)
- [x] Alembic migration created

## Backend models
- [x] SQLAlchemy models in `app/modules/cart/models.py`
- [x] Pydantic: `CartRead` (items with book snapshot, available qty, total), `CartItemSet`

## Business rules
- [x] Setting quantity 0 removes the line
- [x] Cart does not reserve stock; validation uses `inventory.available`

## Related
- [x] API: [../api/cart.md](../api/cart.md)

## Done
- [x] All bullets above complete
