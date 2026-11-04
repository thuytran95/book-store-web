# Feature: Auth

Routes: `/login`, `/register`, `/forgot-password`, `/reset-password`  |  Role: guest  |  Prototype: n/a

## Uses
- [x] Hooks: [../hook/use-auth.md](../hook/use-auth.md)
- [x] Components: `Input`, `Button`, `FormField` from [../component/ui-kit.md](../component/ui-kit.md)

## Pages
- [x] `src/app/(auth)/layout.tsx` (centered card)
- [x] `login/page.tsx` with `next` redirect support
- [x] `register/page.tsx`
- [x] `forgot-password/page.tsx` (always shows "check your email")
- [x] `reset-password/page.tsx` (reads token from query)
- [x] Logged-in users visiting these routes are redirected home

## Behaviour
- [x] Inline field errors; INVALID_CREDENTIALS, ACCOUNT_LOCKED, EMAIL_TAKEN, TOKEN_INVALID messages
- [x] Submit button disabled while pending
- [x] Responsive single-column form

## Done
- [x] All bullets above complete
