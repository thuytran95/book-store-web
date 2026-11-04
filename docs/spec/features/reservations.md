# Feature: Reservations (buyer)

Routes: `/reservations`  |  Role: buyer  |  Prototype: n/a

## Uses
- [x] Hooks: [../hook/use-reservations.md](../hook/use-reservations.md)
- [x] Components: `BookCard`-style row, `ConfirmDialog`

## Pages
- [x] `(shop)/reservations/page.tsx`: list of holds with countdown to expiry
- [x] Actions: cancel, "buy now" (adds to cart / goes to checkout with the reservation id)
- [x] "Reserve" button on book detail (see shop-catalog)

## Behaviour
- [x] Expired holds shown as expired and disabled
- [x] RESERVATION_LIMIT and OUT_OF_STOCK messages
- [x] Empty state

## Done
- [x] All bullets above complete
