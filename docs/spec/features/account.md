# Feature: Account

Routes: `/account/profile`, `/account/addresses`  |  Role: buyer  |  Prototype: n/a

## Uses
- [ ] Hooks: [../hook/use-account.md](../hook/use-account.md)
- [ ] Components: [../component/address-picker.md](../component/address-picker.md)

## Pages
- [ ] `(shop)/account/layout.tsx` with tab/side navigation
- [ ] `profile/page.tsx`: edit name, phone
- [ ] `addresses/page.tsx`: list, add, edit, delete, set default

## Behaviour
- [ ] Route guarded in `middleware.ts`
- [ ] Toast on save; confirm dialog on delete
- [ ] Empty state: no addresses yet
- [ ] Responsive layout

## Done
- [ ] All bullets above complete
