# Feature: Admin Books

Routes: `/admin/books`, `/admin/books/new`, `/admin/books/[id]`  |  Role: admin  |  Prototype: n/a

## Uses
- [x] Hooks: books and image hooks in [../hook/use-admin.md](../hook/use-admin.md)
- [x] Components: [../component/image-uploader.md](../component/image-uploader.md)

## Pages
- [x] `admin/books/page.tsx`: table with search, category/visibility filter, pagination
- [x] Row actions: edit, toggle visibility, mark sold, delete (confirm dialog)
- [x] `admin/books/new/page.tsx` and `[id]/page.tsx`: form with title, author, publisher, year, cost price, sale price, condition, description, quantity, category, visibility
- [x] Image upload section (after first save)

## Behaviour
- [x] Zod validation matching backend; server errors mapped to fields
- [x] Hidden/sold badges in the table
- [x] Toasts on save/delete

## Done
- [x] All bullets above complete
