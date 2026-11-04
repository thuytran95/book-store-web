# API: Users

Base path: `/api/v1/me`, `/api/v1/admin/users`  |  Models: [../model/user.md](../model/user.md)

## Module files
- [x] `app/modules/users/router.py`, `service.py`, `schemas.py`
- [x] Routers registered in `main.py`

## Endpoints
- [x] `GET /me` | buyer/admin | returns UserRead
- [x] `PATCH /me` | buyer/admin | body: UserUpdate
- [x] `GET /me/addresses` | buyer | list
- [x] `POST /me/addresses` | buyer | body: AddressCreate
- [x] `PATCH /me/addresses/{id}` | buyer | own address only
- [x] `DELETE /me/addresses/{id}` | buyer | own address only
- [x] `GET /admin/users` | admin | paginated, search by email/name
- [x] `POST /admin/users/{id}/lock` and `/unlock` | admin

## Service operations
- [x] Address CRUD keeps exactly one default (first address becomes default)

## Cross-cutting
- [x] Ownership check on addresses
- [x] OpenAPI regenerated

## Done
- [x] All bullets above complete
