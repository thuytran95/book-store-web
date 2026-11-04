# Model: Order, OrderItem, OrderStatusHistory

Source: plan section 2 (orders, order_items, order_status_history), status machine  |  Prototype: n/a

## Purpose
- [x] Orders with price/address snapshots and an audited status lifecycle

## Database
- [x] Table `orders`: id, code unique, user_id FK, status, payment_method (`cod`/`bank_transfer`), shipping snapshot (recipient, phone, address text), subtotal, shipping_fee, total, note, cancelled_reason, timestamps
- [x] Table `order_items`: id, order_id FK, book_id FK, title_snapshot, unit_price, quantity
- [x] Table `order_status_history`: id, order_id FK, from_status, to_status, actor_id, at
- [x] Alembic migration created

## Backend models
- [x] Enums `OrderStatus`, `PaymentMethod`
- [x] SQLAlchemy models in `app/modules/orders/models.py`
- [x] Pydantic: `OrderSummary`, `OrderDetail`, `PlaceOrderIn`, `TransitionIn`, `OrderFilter`

## Business rules (state machine)
- [x] Transitions table: pending->confirmed->shipping->completed; cancel from pending/confirmed/shipping
- [x] Buyer may cancel only from `pending`; admin may cancel from the three states
- [x] Prices and address copied at checkout (snapshot)

## Related
- [x] API: [../api/orders.md](../api/orders.md), [../api/inventory.md](../api/inventory.md)

## Done
- [x] All bullets above complete
