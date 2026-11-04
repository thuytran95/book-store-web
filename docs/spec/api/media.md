# API: Media

Base path: `/api/v1/admin/books/{id}/images`  |  Models: [../model/book.md](../model/book.md)

## Module files
- [x] `app/modules/media/service.py`: `save_image(upload) -> url`
- [x] Mount `StaticFiles` for `MEDIA_ROOT` at `/media`

## Rules
- [x] Max `MAX_UPLOAD_MB` (5 MB)
- [x] Verify real type with Pillow (JPEG/PNG/WebP), not file extension
- [x] Resize to max 1600 px, re-encode to WebP, random filename

## Endpoints
- [x] `POST /admin/books/{id}/images` | admin | multipart | returns BookImage
- [x] `DELETE /admin/books/{id}/images/{image_id}` | admin

## Done
- [x] All bullets above complete
