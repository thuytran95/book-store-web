# Model: User, PasswordResetToken, Address

Source: plan section 2 (users, password_reset_tokens, addresses)  |  Prototype: n/a

## Purpose
- [x] Buyer and admin accounts, single-use reset tokens, delivery addresses

## Database
- [x] Table `users`: id, email (citext unique), password_hash, full_name, phone, role (`buyer`/`admin`), is_locked, timestamps
- [x] Table `password_reset_tokens`: id, user_id FK, token_hash, expires_at, used_at
- [x] Table `addresses`: id, user_id FK, recipient, phone, line, ward, district, province, is_default
- [x] Partial unique index: one default address per user
- [x] Alembic migration created

## Backend models
- [x] SQLAlchemy models in `app/modules/users/models.py` and `auth/models.py`
- [x] Enum `UserRole`
- [x] Pydantic schemas: `UserRead`, `UserUpdate`, `AddressCreate/Update/Read`, `RegisterIn`, `LoginIn`

## Frontend types
- [x] Zod schemas in `lib/validation/auth.ts` and `address.ts` (email, password min length, phone format)

## Business rules
- [x] Passwords stored only as bcrypt hash
- [x] Locked users cannot log in
- [x] Reset token valid 30 min, single use

## Related
- [x] API: [../api/auth.md](../api/auth.md), [../api/users.md](../api/users.md)

## Done
- [x] All bullets above complete
