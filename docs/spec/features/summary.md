# Features Summary

## Purpose
User-facing flows: Next.js routes that combine hooks and components. Catalog pages are Server Components (SEO, fast on mobile); cart, checkout, account and admin are Client Components using TanStack Query. Routes come from the plan's screen tables (no prototype).

## Files (in dependency order)
- [ ] [shop-catalog.md](shop-catalog.md): home, book list, book detail | depends on: hook/use-catalog, component/book-card, book-filters
- [ ] [auth.md](auth.md): login, register, forgot/reset password | depends on: hook/use-auth
- [ ] [account.md](account.md): profile, addresses | depends on: hook/use-account
- [ ] [cart-checkout.md](cart-checkout.md): cart and checkout | depends on: hook/use-cart, use-orders
- [ ] [orders.md](orders.md): buyer order history and detail | depends on: cart-checkout
- [ ] [reservations.md](reservations.md): holds | depends on: shop-catalog
- [ ] [book-requests.md](book-requests.md): request a book | depends on: auth
- [ ] [admin-dashboard.md](admin-dashboard.md): stats | depends on: hook/use-admin
- [ ] [admin-books.md](admin-books.md): book table and form | depends on: component/image-uploader
- [ ] [admin-categories.md](admin-categories.md): category CRUD | depends on: hook/use-admin
- [ ] [admin-orders.md](admin-orders.md): order processing | depends on: component/status-timeline
- [ ] [admin-reservations-requests.md](admin-reservations-requests.md): holds and requests | depends on: hook/use-admin
- [ ] [admin-users.md](admin-users.md): lock/unlock users | depends on: hook/use-admin
- [ ] [hardening.md](hardening.md): rate limit, logging, backup, production compose | depends on: all above

## Shared rules
- [ ] Each page has loading, empty and error states
- [ ] Shop is mobile-first (375 px), admin desktop-first (1280 px)
- [ ] No test tasks (fast development)

## Done
- [ ] All files above ticked
