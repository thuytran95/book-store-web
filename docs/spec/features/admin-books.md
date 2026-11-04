# Feature: Admin Books

Routes: `/admin/books`, `/admin/books/new`, `/admin/books/[id]`  |  Role: admin  |  Prototype: n/a

## Uses
- [ ] Hooks: books and image hooks in [../hook/use-admin.md](../hook/use-admin.md)
- [ ] Components: [../component/image-uploader.md](../component/image-uploader.md)

## Pages
- [ ] `admin/books/page.tsx`: table with search, category/visibility filter, pagination
- [ ] Row actions: edit, toggle visibility, mark sold, delete (confirm dialog)
- [ ] `admin/books/new/page.tsx` and `[id]/page.tsx`: form with title, author, publisher, year, cost price, sale price, condition, description, quantity, category, visibility
- [ ] Image upload section (after first save)

## Behaviour
- [ ] Zod validation matching backend; server errors mapped to fields
- [ ] Hidden/sold badges in the table
- [ ] Toasts on save/delete

## Done
- [ ] All bullets above complete
