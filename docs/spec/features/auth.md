# Feature: Auth

Routes: `/login`, `/register`, `/forgot-password`, `/reset-password`  |  Role: guest  |  Prototype: n/a

## Uses
- [ ] Hooks: [../hook/use-auth.md](../hook/use-auth.md)
- [ ] Components: `Input`, `Button`, `FormField` from [../component/ui-kit.md](../component/ui-kit.md)

## Pages
- [ ] `src/app/(auth)/layout.tsx` (centered card)
- [ ] `login/page.tsx` with `next` redirect support
- [ ] `register/page.tsx`
- [ ] `forgot-password/page.tsx` (always shows "check your email")
- [ ] `reset-password/page.tsx` (reads token from query)
- [ ] Logged-in users visiting these routes are redirected home

## Behaviour
- [ ] Inline field errors; INVALID_CREDENTIALS, ACCOUNT_LOCKED, EMAIL_TAKEN, TOKEN_INVALID messages
- [ ] Submit button disabled while pending
- [ ] Responsive single-column form

## Done
- [ ] All bullets above complete
