# Component: BookCard

File: `frontend/src/features/catalog/components/book-card.tsx`  |  Type: feature  |  Prototype: n/a

## Props
- [x] `book: BookCard` (title, author, slug, image, price, condition, available qty)

## Variants and states
- [x] Out of stock / sold overlay
- [x] "Almost gone" label when available qty is low

## Behaviour
- [x] Links to `/books/[slug]`
- [x] Uses `PriceTag`, `ConditionBadge`
- [x] Image with fallback placeholder, lazy loading

## Used by
- [x] [../features/shop-catalog.md](../features/shop-catalog.md)

## Done
- [x] All bullets above complete
