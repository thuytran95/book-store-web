# Hook: API client, session, guards, formatting

APIs used: [../api/core.md](../api/core.md), [../api/auth.md](../api/auth.md)  |  Location: `frontend/src/lib/`

## API client (`lib/api/`)
- [x] Generate `schema.d.ts` with `npm run gen:api`
- [x] Typed client with openapi-fetch (`api.GET/POST/PATCH/PUT/DELETE`)
- [x] Base URL from `NEXT_PUBLIC_API_URL`, `credentials: include`
- [x] Forward cookies in Server Components
- [x] Error envelope -> `ApiError(code, message, details)`
- [x] On 401: call refresh once, retry, else redirect to login

## Session (`lib/session.ts`)
- [x] `getSession()` for server components (calls `/me`)
- [x] `useSession()` client hook returning `{ user, role } | null`

## Guards
- [x] `middleware.ts`: `/account/**`, `/checkout`, `/orders/**`, `/reservations`, `/book-requests` need login; `/admin/**` needs admin; redirect to `/login?next=`

## Providers and helpers
- [x] TanStack Query provider in root layout
- [x] `lib/format.ts`: `formatVnd`, `formatDate`, `conditionLabel`, `orderStatusLabel`, `orderStatusColor` (vi-VN)

## Done
- [x] All bullets above complete
