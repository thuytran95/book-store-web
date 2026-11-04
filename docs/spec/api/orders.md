# API: Orders (deep module)

Base path: `/api/v1/orders`, `/admin/orders`  |  Models: [../model/order.md](../model/order.md)  |  Uses: [inventory.md](inventory.md), [cart.md](cart.md)

## Module files
- [x] `app/modules/orders/router.py`, `admin_router.py`, `service.py`, `state_machine.py`, `schemas.py`

## Endpoints (buyer)
- [x] `POST /orders` | buyer | body: address_id, payment_method, note, reservation_ids | errors: OUT_OF_STOCK (409), CART_EMPTY, BOOK_UNAVAILABLE
- [x] `GET /orders` | buyer | own orders, paginated
- [x] `GET /orders/{id}` | buyer | own order only
- [x] `POST /orders/{id}/cancel` | buyer | only while pending | errors: INVALID_TRANSITION

## Endpoints (admin)
- [x] `GET /admin/orders?status=` | admin | paginated
- [x] `GET /admin/orders/{id}` | admin
- [x] `POST /admin/orders/{id}/transition` | admin | body: to, reason | errors: INVALID_TRANSITION

## Service operations
- [x] `place_order`: read cart, re-check visibility and price, `inventory.allocate`, snapshot prices and address, compute totals, clear cart, convert used reservations; all in one transaction
- [x] `transition`: validates against state table and actor permission, `inventory.commit` on confirm, `inventory.release` on cancel, writes history row
- [x] Order `code` generation (human readable, unique)
- [x] Routers never set `order.status` directly

## Done
- [x] All bullets above complete
