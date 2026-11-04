# Hook: Account

APIs used: [../api/users.md](../api/users.md)  |  Location: `frontend/src/features/account/hooks/`

## Hooks
- [x] `useProfile()` query `["me"]`; `useUpdateProfile()` mutation, invalidates `["me"]`
- [x] `useAddresses()` query `["addresses"]`
- [x] `useCreateAddress()`, `useUpdateAddress()`, `useDeleteAddress()` mutations, invalidate `["addresses"]`
- [x] `useSetDefaultAddress()` (PATCH `is_default`)

## Forms
- [x] Profile and address forms with Zod schemas

## Done
- [x] All bullets above complete
