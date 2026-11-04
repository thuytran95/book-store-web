# API: Book Requests

Base path: `/api/v1/book-requests`, `/admin/book-requests`  |  Models: [../model/book-request.md](../model/book-request.md)

## Module files
- [x] `app/modules/book_requests/router.py`, `admin_router.py`, `service.py`, `schemas.py`

## Endpoints
- [x] `POST /book-requests` | buyer | body: BookRequestCreate
- [x] `GET /book-requests` | buyer | own requests
- [x] `GET /admin/book-requests?status=` | admin | paginated
- [x] `POST /admin/book-requests/{id}/resolve` | admin | body: status (`available`/`rejected`), admin_note | errors: ALREADY_RESOLVED

## Done
- [x] All bullets above complete
