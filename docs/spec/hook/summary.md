# Hook Summary

## Purpose
Frontend data layer: typed API client, session, and TanStack Query hooks per feature area under `frontend/src/features/<area>/hooks/`. Hooks wrap the API specs and hide cache keys, optimistic updates and error-code handling from components.

## Files (in dependency order)
- [ ] [api-client-session.md](api-client-session.md): typed client, session, route guards, format helpers | depends on: api/core, api/auth
- [ ] [use-auth.md](use-auth.md): login, register, logout, password reset | depends on: api-client-session
- [ ] [use-account.md](use-account.md): profile, addresses | depends on: api-client-session
- [ ] [use-catalog.md](use-catalog.md): book search/detail, categories | depends on: api-client-session
- [ ] [use-cart.md](use-cart.md): cart with optimistic updates | depends on: use-catalog
- [ ] [use-orders.md](use-orders.md): place, list, detail, cancel | depends on: use-cart, use-account
- [ ] [use-reservations.md](use-reservations.md): holds | depends on: use-catalog
- [ ] [use-book-requests.md](use-book-requests.md): requests | depends on: api-client-session
- [ ] [use-admin.md](use-admin.md): all admin data hooks | depends on: all above

## Shared rules
- [ ] Switch on error `code`, never on message text
- [ ] Types come from generated `schema.d.ts`

## Done
- [ ] All files above ticked
