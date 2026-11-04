# API: Core (cross-cutting)

Base path: n/a  |  Models: [../model/00-project-setup.md](../model/00-project-setup.md)

## Module files
- [x] `app/core/errors.py`: `DomainError` base + subclasses (`OutOfStock`, `CartEmpty`, `BookUnavailable`, `InvalidTransition`, `Forbidden`, `NotFound`, `Conflict`)
- [x] Exception handler returning `{"error": {"code", "message", "details"}}` with correct status
- [x] `app/core/security.py`: bcrypt hash/verify, JWT encode/decode
- [x] `app/core/deps.py`: `current_user` (cookie JWT), `require_admin`
- [x] `app/core/pagination.py`: `PageParams`, `Page[T]`
- [x] Request-id middleware + structured JSON logging
- [x] CORS limited to `CORS_ORIGINS`
- [x] Transaction helper (session passed into services; services never commit themselves)

## Done
- [x] All bullets above complete
