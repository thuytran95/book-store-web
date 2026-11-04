# Model: Reservation

Source: plan section 2 (reservations), 3.3  |  Prototype: n/a

## Purpose
- [x] Hold an in-stock book for a buyer for N days

## Database
- [x] Table `reservations`: id, user_id FK, book_id FK, quantity, status (`active`/`converted`/`cancelled`/`expired`), expires_at, timestamps
- [x] Index on (status, expires_at)
- [x] Alembic migration created

## Backend models
- [x] Enum `ReservationStatus`; SQLAlchemy model in `app/modules/reservations/models.py`
- [x] Pydantic: `ReservationRead`, `ReserveIn`

## Business rules
- [x] Hold length `RESERVATION_HOLD_DAYS`; max active per user `MAX_ACTIVE_RESERVATIONS`
- [x] Expired holds are ignored lazily in availability; job only updates status

## Related
- [x] API: [../api/reservations.md](../api/reservations.md)

## Done
- [x] All bullets above complete
