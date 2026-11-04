# Component: AddressPicker / AddressForm

File: `frontend/src/features/account/components/`  |  Type: feature  |  Prototype: n/a

## Props
- [x] `AddressPicker`: `addresses`, `value`, `onChange`, `allowNew`
- [x] `AddressForm`: `defaultValues?`, `onSubmit`

## Behaviour
- [x] Radio list with default marked; "add new address" opens a `Dialog` with `AddressForm`
- [x] Fields: recipient, phone, line, ward, district, province, default flag
- [x] Zod validation and server error mapping

## Used by
- [x] [../features/cart-checkout.md](../features/cart-checkout.md), [../features/account.md](../features/account.md)

## Done
- [x] All bullets above complete
