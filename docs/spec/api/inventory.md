# API: Inventory (deep module, no router)

Base path: none  |  Models: [../model/book.md](../model/book.md), [../model/order.md](../model/order.md), [../model/reservation.md](../model/reservation.md)

## Purpose
- [x] Only module allowed to change `books.quantity`; prevents double-selling

## Module files
- [x] `app/modules/inventory/service.py`, exported via `__init__.py`

## Interface
- [x] `available(book_ids) -> dict[int, int]`
- [x] `allocate(lines, owner)`: all-or-nothing, raises `OutOfStock(book_id, requested, available)`
- [x] `commit(owner)`: deducts `books.quantity` (on order confirm)
- [x] `release(owner)`: frees allocation, or restores quantity if already committed (on cancel)
- [x] `set_quantity(book_id, quantity)`: admin edit / mark sold
- [x] `Owner` = `Order(id)` | `Reservation(id)`

## Invariants
- [x] Runs inside the caller's transaction; never commits itself
- [x] `allocate` takes `SELECT ... FOR UPDATE` on `books` in ascending id order (no deadlocks)
- [x] `available = quantity - pending/unconfirmed order items - active unexpired reservations not owned by the caller`
- [x] Expired reservations ignored lazily in `available`

## Done
- [x] All bullets above complete
