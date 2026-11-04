# Feature: Buyer Orders

Routes: `/orders`, `/orders/[id]`  |  Role: buyer  |  Prototype: n/a

## Uses
- [ ] Hooks: [../hook/use-orders.md](../hook/use-orders.md)
- [ ] Components: [../component/status-timeline.md](../component/status-timeline.md), [../component/badges.md](../component/badges.md)

## Pages
- [ ] `(shop)/orders/page.tsx`: paginated history with status badge, total, date
- [ ] `(shop)/orders/[id]/page.tsx`: items, address, payment, total, status timeline
- [ ] Cancel button only while status is `pending` (confirm dialog)

## Behaviour
- [ ] Empty state: no orders yet
- [ ] INVALID_TRANSITION shown as "order already processed"
- [ ] Only own orders accessible (404 otherwise)

## Done
- [ ] All bullets above complete
