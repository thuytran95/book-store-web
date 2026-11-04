# Feature: Reservations (buyer)

Routes: `/reservations`  |  Role: buyer  |  Prototype: n/a

## Uses
- [ ] Hooks: [../hook/use-reservations.md](../hook/use-reservations.md)
- [ ] Components: `BookCard`-style row, `ConfirmDialog`

## Pages
- [ ] `(shop)/reservations/page.tsx`: list of holds with countdown to expiry
- [ ] Actions: cancel, "buy now" (adds to cart / goes to checkout with the reservation id)
- [ ] "Reserve" button on book detail (see shop-catalog)

## Behaviour
- [ ] Expired holds shown as expired and disabled
- [ ] RESERVATION_LIMIT and OUT_OF_STOCK messages
- [ ] Empty state

## Done
- [ ] All bullets above complete
