# API Summary

## Purpose
FastAPI modules under `backend/app/modules/`, base path `/api/v1`. Deep modules (`inventory`, `orders`, `reservations`, `catalog` search) hold the business logic; simple CRUD stays thin. After any API change, regenerate the TS client with `npm run gen:api`.

## Files (in dependency order)
- [x] [core.md](core.md): errors, deps, pagination, request-id | depends on: model/00
- [x] [mail.md](mail.md): Mailer port, console + SMTP adapters | depends on: core
- [x] [auth.md](auth.md): register, login, logout, refresh, password reset | depends on: core, mail, model/user
- [x] [users.md](users.md): profile, addresses, admin user lock | depends on: auth
- [x] [media.md](media.md): image upload | depends on: core
- [x] [catalog.md](catalog.md): public search/detail, admin books + categories | depends on: media, model/book
- [x] [inventory.md](inventory.md): stock allocation (no router) | depends on: catalog
- [x] [cart.md](cart.md): cart endpoints | depends on: inventory
- [x] [orders.md](orders.md): checkout, lifecycle, admin orders | depends on: inventory, cart, users
- [x] [reservations.md](reservations.md): holds + expiry job | depends on: inventory
- [x] [book-requests.md](book-requests.md): request a book | depends on: users
- [x] [reports.md](reports.md): dashboard statistics | depends on: orders

## Shared rules
- [x] Routers use `current_user` / `require_admin`; every `/admin/*` router mounts `require_admin`
- [x] Errors are `DomainError` subclasses with a stable `code`
- [x] No test tasks (fast development)

## Done
- [x] All files above ticked
