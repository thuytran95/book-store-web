# Frontend architecture

Next.js 15 (App Router, RSC) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (style `base-nova`, on
`@base-ui/react`) · TanStack Query v5 · react-hook-form + zod v4 · openapi-fetch + openapi-typescript ·
recharts · sonner · npm. UI copy is Vietnamese (`lang="vi"`, font Noto Sans JP via `next/font`, exposed as `--font-sans`). Body text is 16px on every screen: `body`, `text-sm` and `text-body-md` are all 16px (set in `globals.css`); use `text-xs` / `text-body-sm` for small text.

## Layout (`frontend/src/`)

```
app/                      routes only; pages stay thin and render a feature component
├── layout.tsx            root: fonts, Material Symbols, <Providers>, <Toaster>
├── (shop)/               storefront + buyer pages (shop-layout)
├── (auth)/               login, register, forgot-password, reset-password
└── admin/                admin pages (admin-layout)
features/<domain>/
├── components/           domain UI
├── hooks/                TanStack Query hooks, re-exported from hooks/index.ts
└── server.ts             (catalog) cached server-side fetchers for RSC
components/
├── ui/                   shadcn primitives (button, dialog, table, …)
├── layout/               shop-layout, admin-layout
├── shared/               cross-domain bits (badges, link-button, table-pagination)
└── providers.tsx         QueryClient (staleTime 30s, no 4xx retry)
config/                   static page config (home, catalog-home tabs)
lib/                      api clients, errors, formatting, validation, session
middleware.ts             route guard
```

## Routes

| Area                   | Routes                                                                                                                                                                                                                                                   | Feature folder                                               |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Shop                   | `/`, `/books`, `/books/[slug]`                                                                                                                                                                                                                           | `home`, `catalog` (incl. `catalog/book-detail/`)             |
| Auth                   | `/login`, `/register`, `/forgot-password`, `/reset-password`                                                                                                                                                                                             | `auth`                                                       |
| Buyer (login required) | `/cart`, `/checkout`, `/orders`, `/orders/[id]`, `/reservations`, `/book-requests`, `/account/profile`, `/account/addresses`                                                                                                                             | `cart`, `orders`, `reservations`, `book-requests`, `account` |
| Admin (admin role)     | `/admin` (inventory home), `/admin/books`, `/admin/books/new`, `/admin/books/[id]`, `/admin/categories` (create/rename in a dialog), `/admin/orders`, `/admin/orders/[id]`, `/admin/reservations`, `/admin/book-requests`, `/admin/users`, `/admin/reports` | `admin` (components grouped by domain: `components/{inventory,book,category,order,reservation,book-request,user,report}/`) |

## Data access

Every call goes through the typed clients in `lib/api/`, built from the generated `lib/api/schema.d.ts`:

| Client                                | Where                              | Behaviour                                                                                    |
| ------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------- |
| `api` (`client.ts`)                   | Client Components / hooks          | `credentials: include`; on 401 refreshes once and retries, else redirects to `/login?next=…` |
| `serverApi()` (`server.ts`)           | Server Components needing the user | forwards request cookies, `no-store`, cannot refresh                                         |
| `publicApi(revalidate)` (`server.ts`) | public catalog RSC                 | no cookies, ISR (`revalidate` seconds)                                                       |

- Non-2xx responses throw `ApiError { code, status, details, fieldErrors }` (`lib/api/errors.ts`).
  Check codes with `hasCode(e, "OUT_OF_STOCK")`.
- Types come from the schema: `components["schemas"]["BookCard"]`, `paths[...]`.
- Server base URL: `API_INTERNAL_URL` (Docker `http://backend:8000`), otherwise `NEXT_PUBLIC_API_URL`
  (origin only, no `/api/v1`). `/media/*` is rewritten to the backend (`next.config.ts`).
- Regenerate types after any backend API change: `npm run gen:api` (backend on :8000).

## State and hooks

- Server state lives only in TanStack Query. Each feature's `hooks/use-<domain>.ts` exports query hooks
  (`useAdminBooks`, `useCart`, …) and mutation hooks that invalidate their keys. Shared keys: `["me"]` session,
  `["cart"]` cart (optimistic updates with rollback).
- Session: `useSession()` (`lib/session.ts`, client) and `lib/session-server.ts` (server).
- URL state: catalog filters via `lib/book-query.ts` (`BookQuery` ↔ search params, page size 24);
  admin inventory filters via `features/admin/hooks/use-admin-inventory-filters.ts`.
- Pagination: math in `lib/pagination.ts` (`getPageInfo`, `getPageWindow`); state via `usePagination({ total, pageSize })`
  or `useClientPagination(items, pageSize)` (returns `pageItems`) from `lib/use-pagination.ts`. UI: `TablePagination`
  (footer bar with range text) and `Pager` (round buttons) from `components/shared/table-pagination.tsx`.

## Forms, errors, feedback

- Zod schemas in `lib/validation/*.ts` + react-hook-form (`@hookform/resolvers`).
- Server 422s: `applyServerErrors(error, setError)` (`lib/forms.ts`) maps `details.fields` onto form fields.
- User-facing error text: `lib/error-messages.ts`, keyed by backend `code`. Never show the server `message`.
- Toasts: `toast` / `toast.success` / `toast.error` from `lib/toast.ts`.
- Formatting: `formatVnd`, `formatDate`, `conditionLabel`, order status labels in `lib/format.ts`.

## Auth and route guard

- The backend sets httpOnly cookies `access_token` / `refresh_token`.
- `middleware.ts` decodes the access token **without verifying it** (routing only) and redirects:
  not logged in → `/login?next=…`; non-admin on `/admin` → `/`. The API still enforces auth.
- A new protected route must be added to `LOGIN_PATHS` / `ADMIN_PATH` **and** `config.matcher`.

## Styling

- Tailwind v4 with design tokens in `app/globals.css` (`--canvas`, `--primary-container`, `--tertiary`,
  `--accent-warm`, …) from the "serene botanical editorial" prototype (`docs/prototype/`).
- Icons: `lucide-react`, or `MaterialIcon` (`features/home/components/material-icon.tsx`) for prototype screens.
- `cn()` from `lib/utils.ts`. Add shadcn components with the shadcn CLI into `components/ui/`.
- Links that look like buttons use `LinkButton` (`components/shared/link-button.tsx`): pill, 16px text,
  `variant="filled" | "outline"`, `size="default" | "sm"`. Don't style `Link` by hand or use
  `<Button render={<Link />}>`; `Button` is for actions without navigation.
- Shop is mobile-first; admin targets desktop.

## Adding a screen (checklist)

1. Make sure the API exists and `schema.d.ts` is regenerated.
2. Hook in `features/<domain>/hooks/use-<domain>.ts` (+ export from `hooks/index.ts`).
3. Zod schema in `lib/validation/` if there is a form.
4. Components in `features/<domain>/components/` using `components/ui/`. In `features/admin/`, put them in the
   matching sub-folder (`components/category/`, `components/book/`, …).
5. Thin `page.tsx` in `app/…` (set `metadata`); RSC pages fetch via `features/<domain>/server.ts`.
6. Update `middleware.ts` if the route needs login or admin.
7. Add any new backend error codes to `lib/error-messages.ts`.
