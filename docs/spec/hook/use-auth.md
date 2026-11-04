# Hook: Auth

APIs used: [../api/auth.md](../api/auth.md)  |  Location: `frontend/src/features/auth/hooks/`

## Hooks
- [x] `useLogin()` mutation `POST /auth/login`; on success invalidate session, redirect to `next`
  - [x] Handles INVALID_CREDENTIALS, ACCOUNT_LOCKED
- [x] `useRegister()` mutation `POST /auth/register`
  - [x] Handles EMAIL_TAKEN
- [x] `useLogout()` mutation `POST /auth/logout`; clear query cache
- [x] `useForgotPassword()` mutation `POST /auth/password/forgot`
- [x] `useResetPassword()` mutation `POST /auth/password/reset`
  - [x] Handles TOKEN_INVALID

## Forms
- [x] Zod schemas (login, register, forgot, reset) from [../model/user.md](../model/user.md)
- [x] Server field errors mapped onto form fields

## Done
- [x] All bullets above complete
