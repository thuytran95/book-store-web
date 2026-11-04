# Features Summary

## Purpose
User-facing flows: Next.js routes that combine hooks and components. Catalog pages are Server Components (SEO, fast on mobile); cart, checkout, account and admin are Client Components using TanStack Query. Routes come from the plan's screen tables (no prototype).

## Files (in dependency order)
- [x] [shop-catalog.md](shop-catalog.md): home, book list, book detail | depends on: hook/use-catalog, component/book-card, book-filters
- [x] [auth.md](auth.md): login, register, forgot/reset password | depends on: hook/use-auth
- [x] [account.md](account.md): profile, addresses | depends on: hook/use-account
- [x] [cart-checkout.md](cart-checkout.md): cart and checkout | depends on: hook/use-cart, use-orders
- [x] [orders.md](orders.md): buyer order history and detail | depends on: cart-checkout
- [x] [reservations.md](reservations.md): holds | depends on: shop-catalog
- [x] [book-requests.md](book-requests.md): request a book | depends on: auth
- [x] [admin-dashboard.md](admin-dashboard.md): stats | depends on: hook/use-admin
- [x] [admin-books.md](admin-books.md): book table and form | depends on: component/image-uploader
- [x] [admin-categories.md](admin-categories.md): category CRUD | depends on: hook/use-admin
- [x] [admin-orders.md](admin-orders.md): order processing | depends on: component/status-timeline
- [x] [admin-reservations-requests.md](admin-reservations-requests.md): holds and requests | depends on: hook/use-admin
- [x] [admin-users.md](admin-users.md): lock/unlock users | depends on: hook/use-admin
- [x] [hardening.md](hardening.md): rate limit, logging, backup, production compose | depends on: all above

## Shared rules
- [x] Each page has loading, empty and error states
- [x] Shop is mobile-first (375 px), admin desktop-first (1280 px)
- [x] No test tasks (fast development)

## Done
- [x] All files above ticked
