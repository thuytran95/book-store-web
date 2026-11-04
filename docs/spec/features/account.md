# Feature: Account

Routes: `/account/profile`, `/account/addresses`  |  Role: buyer  |  Prototype: n/a

## Uses
- [x] Hooks: [../hook/use-account.md](../hook/use-account.md)
- [x] Components: [../component/address-picker.md](../component/address-picker.md)

## Pages
- [x] `(shop)/account/layout.tsx` with tab/side navigation
- [x] `profile/page.tsx`: edit name, phone
- [x] `addresses/page.tsx`: list, add, edit, delete, set default

## Behaviour
- [x] Route guarded in `middleware.ts`
- [x] Toast on save; confirm dialog on delete
- [x] Empty state: no addresses yet
- [x] Responsive layout

## Done
- [x] All bullets above complete
