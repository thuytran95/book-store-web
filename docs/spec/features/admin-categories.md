# Feature: Admin Categories

Routes: `/admin/categories`  |  Role: admin  |  Prototype: n/a

## Uses
- [x] Hooks: category hooks in [../hook/use-admin.md](../hook/use-admin.md)

## Pages
- [x] `admin/categories/page.tsx`: table with book count, add/edit dialog
- [x] Delete dialog: if the category has books, require choosing "move books to..." target

## Behaviour
- [x] CATEGORY_NOT_EMPTY handled by showing the move option
- [x] Unique name validation message

## Done
- [x] All bullets above complete
