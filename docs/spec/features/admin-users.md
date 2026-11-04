# Feature: Admin Users

Routes: `/admin/users`  |  Role: admin  |  Prototype: n/a

## Uses
- [x] Hooks: `useAdminUsers`, `useSetUserLocked` from [../hook/use-admin.md](../hook/use-admin.md)

## Pages
- [x] `admin/users/page.tsx`: table (name, email, role, status), search, pagination
- [x] Lock/unlock action with confirm dialog

## Behaviour
- [x] Admin cannot lock their own account
- [x] Locked badge in the row

## Done
- [x] All bullets above complete
