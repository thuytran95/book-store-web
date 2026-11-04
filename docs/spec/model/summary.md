# Model Summary

## Purpose
Database tables, SQLAlchemy models, Pydantic schemas, enums and form validation for every entity. Everything else depends on this part. Money is `BIGINT` VND; every table has `created_at`/`updated_at` (`timestamptz`).

## Files (in dependency order)
- [x] [00-project-setup.md](00-project-setup.md): repo, docker, backend core, DB, Alembic, Next.js scaffold | depends on: none
- [x] [user.md](user.md): users, password reset tokens, addresses | depends on: 00
- [x] [category.md](category.md): categories | depends on: 00
- [x] [book.md](book.md): books, book images, search indexes | depends on: category
- [x] [cart.md](cart.md): carts, cart items | depends on: user, book
- [x] [order.md](order.md): orders, items, status history, status machine | depends on: user, book
- [x] [reservation.md](reservation.md): reservations | depends on: user, book
- [x] [book-request.md](book-request.md): book requests | depends on: user

## Shared rules
- [x] Alembic migration per file, applied in this order
- [x] TS types come from generated `schema.d.ts`, never hand-written

## Done
- [x] All files above ticked
