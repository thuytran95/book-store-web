# Hook: Auth

APIs used: [../api/auth.md](../api/auth.md)  |  Location: `frontend/src/features/auth/hooks/`

## Hooks
- [ ] `useLogin()` mutation `POST /auth/login`; on success invalidate session, redirect to `next`
  - [ ] Handles INVALID_CREDENTIALS, ACCOUNT_LOCKED
- [ ] `useRegister()` mutation `POST /auth/register`
  - [ ] Handles EMAIL_TAKEN
- [ ] `useLogout()` mutation `POST /auth/logout`; clear query cache
- [ ] `useForgotPassword()` mutation `POST /auth/password/forgot`
- [ ] `useResetPassword()` mutation `POST /auth/password/reset`
  - [ ] Handles TOKEN_INVALID

## Forms
- [ ] Zod schemas (login, register, forgot, reset) from [../model/user.md](../model/user.md)
- [ ] Server field errors mapped onto form fields

## Done
- [ ] All bullets above complete
