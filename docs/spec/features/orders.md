# Feature: Buyer Orders

Routes: `/orders`, `/orders/[id]`  |  Role: buyer  |  Prototype: n/a

## Uses
- [x] Hooks: [../hook/use-orders.md](../hook/use-orders.md)
- [x] Components: [../component/status-timeline.md](../component/status-timeline.md), [../component/badges.md](../component/badges.md)

## Pages
- [x] `(shop)/orders/page.tsx`: paginated history with status badge, total, date
- [x] `(shop)/orders/[id]/page.tsx`: items, address, payment, total, status timeline
- [x] Cancel button only while status is `pending` (confirm dialog)

## Behaviour
- [x] Empty state: no orders yet
- [x] INVALID_TRANSITION shown as "order already processed"
- [x] Only own orders accessible (404 otherwise)

## Done
- [x] All bullets above complete
