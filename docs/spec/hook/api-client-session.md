# Hook: API client, session, guards, formatting

APIs used: [../api/core.md](../api/core.md), [../api/auth.md](../api/auth.md)  |  Location: `frontend/src/lib/`

## API client (`lib/api/`)
- [ ] Generate `schema.d.ts` with `npm run gen:api`
- [ ] Typed client with openapi-fetch (`api.GET/POST/PATCH/PUT/DELETE`)
- [ ] Base URL from `NEXT_PUBLIC_API_URL`, `credentials: include`
- [ ] Forward cookies in Server Components
- [ ] Error envelope -> `ApiError(code, message, details)`
- [ ] On 401: call refresh once, retry, else redirect to login

## Session (`lib/session.ts`)
- [ ] `getSession()` for server components (calls `/me`)
- [ ] `useSession()` client hook returning `{ user, role } | null`

## Guards
- [ ] `middleware.ts`: `/account/**`, `/checkout`, `/orders/**`, `/reservations`, `/book-requests` need login; `/admin/**` needs admin; redirect to `/login?next=`

## Providers and helpers
- [ ] TanStack Query provider in root layout
- [ ] `lib/format.ts`: `formatVnd`, `formatDate`, `conditionLabel`, `orderStatusLabel`, `orderStatusColor` (vi-VN)

## Done
- [ ] All bullets above complete
