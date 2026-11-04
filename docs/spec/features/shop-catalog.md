# Feature: Shop Catalog

Routes: `/`, `/books`, `/books/[slug]`  |  Role: guest/buyer  |  Prototype: n/a

## Uses
- [x] Hooks: [../hook/use-catalog.md](../hook/use-catalog.md), [../hook/use-cart.md](../hook/use-cart.md), [../hook/use-reservations.md](../hook/use-reservations.md)
- [x] Components: [../component/book-card.md](../component/book-card.md), [../component/book-filters.md](../component/book-filters.md), [../component/shop-layout.md](../component/shop-layout.md)

## Pages
- [x] `src/app/(shop)/layout.tsx` using ShopLayout
- [x] `src/app/(shop)/page.tsx` (Server): search bar, categories, newest books, "almost gone" books
- [x] `src/app/(shop)/books/page.tsx` (Server shell + client filters): filters, sort, pagination
- [x] `src/app/(shop)/books/[slug]/page.tsx` (Server): image gallery, price, condition, description, available qty, Add to cart, Reserve
- [x] Page metadata (title, description) for SEO

## Behaviour
- [x] Happy path: search/filter -> list -> detail -> add to cart
- [x] Guest clicking Add to cart or Reserve is redirected to `/login?next=`
- [x] Empty state for no results
- [x] Loading skeletons
- [x] Out-of-stock/sold detail disables buttons and offers "request this book"
- [x] Responsive: filter drawer on mobile, sidebar on desktop

## Done
- [x] All bullets above complete
