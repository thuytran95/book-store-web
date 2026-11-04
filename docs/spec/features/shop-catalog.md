# Feature: Shop Catalog

Routes: `/`, `/books`, `/books/[slug]`  |  Role: guest/buyer  |  Prototype: n/a

## Uses
- [ ] Hooks: [../hook/use-catalog.md](../hook/use-catalog.md), [../hook/use-cart.md](../hook/use-cart.md), [../hook/use-reservations.md](../hook/use-reservations.md)
- [ ] Components: [../component/book-card.md](../component/book-card.md), [../component/book-filters.md](../component/book-filters.md), [../component/shop-layout.md](../component/shop-layout.md)

## Pages
- [ ] `src/app/(shop)/layout.tsx` using ShopLayout
- [ ] `src/app/(shop)/page.tsx` (Server): search bar, categories, newest books, "almost gone" books
- [ ] `src/app/(shop)/books/page.tsx` (Server shell + client filters): filters, sort, pagination
- [ ] `src/app/(shop)/books/[slug]/page.tsx` (Server): image gallery, price, condition, description, available qty, Add to cart, Reserve
- [ ] Page metadata (title, description) for SEO

## Behaviour
- [ ] Happy path: search/filter -> list -> detail -> add to cart
- [ ] Guest clicking Add to cart or Reserve is redirected to `/login?next=`
- [ ] Empty state for no results
- [ ] Loading skeletons
- [ ] Out-of-stock/sold detail disables buttons and offers "request this book"
- [ ] Responsive: filter drawer on mobile, sidebar on desktop

## Done
- [ ] All bullets above complete
