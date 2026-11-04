# API: Reports

Base path: `/api/v1/admin/reports`  |  Models: [../model/order.md](../model/order.md), [../model/book.md](../model/book.md)

## Module files
- [x] `app/modules/reports/router.py`, `service.py`, `schemas.py` (read-only SQL aggregates)

## Endpoints
- [x] `GET /admin/reports/revenue?granularity=day|month&from=&to=` | admin | counts `completed` orders only
- [x] `GET /admin/reports/summary` | admin | order counts by status
- [x] `GET /admin/reports/best-sellers?limit=` | admin
- [x] `GET /admin/reports/low-stock?threshold=` | admin

## Done
- [x] All bullets above complete
