# API: Reservations (deep module)

Base path: `/api/v1/reservations`, `/admin/reservations`  |  Models: [../model/reservation.md](../model/reservation.md)  |  Uses: [inventory.md](inventory.md)

## Module files
- [x] `app/modules/reservations/router.py`, `admin_router.py`, `service.py`, `schemas.py`
- [x] `app/jobs/expire_reservations.py` (APScheduler in-process, every 10 min)

## Endpoints
- [x] `POST /reservations` | buyer | body: book_id, quantity | errors: OUT_OF_STOCK, RESERVATION_LIMIT
- [x] `GET /reservations` | buyer | own holds
- [x] `POST /reservations/{id}/cancel` | buyer | own hold
- [x] `GET /admin/reservations` | admin | active/expired
- [x] `POST /admin/reservations/{id}/cancel` | admin

## Service operations
- [x] `reserve` uses `inventory.allocate`, expires after `RESERVATION_HOLD_DAYS`
- [x] `cancel` releases via `inventory.release`
- [x] `expire_due(now)` idempotent, sets status `expired`
- [x] Limit active holds per user to `MAX_ACTIVE_RESERVATIONS`
- [x] Job registered on app startup

## Done
- [x] All bullets above complete
