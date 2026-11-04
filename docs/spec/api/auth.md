# API: Auth

Base path: `/api/v1/auth`  |  Models: [../model/user.md](../model/user.md)

## Module files
- [x] `app/modules/auth/router.py`, `service.py`, `schemas.py`
- [x] Router registered in `main.py`

## Endpoints
- [x] `POST /auth/register` | public | body: RegisterIn | returns: UserRead | errors: EMAIL_TAKEN
- [x] `POST /auth/login` | public | body: LoginIn | sets httpOnly `access_token` cookie (+ refresh) | errors: INVALID_CREDENTIALS, ACCOUNT_LOCKED
- [x] `POST /auth/logout` | buyer/admin | clears cookies
- [x] `POST /auth/refresh` | cookie | rotates refresh token
- [x] `POST /auth/password/forgot` | public | always 202; sends reset email via Mailer
- [x] `POST /auth/password/reset` | public | body: token, new password | errors: TOKEN_INVALID

## Service operations
- [x] `register`, `login`, `request_password_reset`, `reset_password` (token stored hashed, single use, 30 min)

## Cross-cutting
- [x] Rate limit (slowapi) on login, register, forgot
- [x] Locked user rejected at login and in `current_user`
- [x] OpenAPI regenerated (`npm run gen:api`)

## Done
- [x] All bullets above complete
