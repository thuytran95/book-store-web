import { z } from "zod";
import { phoneSchema } from "./auth";

export const checkoutSchema = z.object({
  ship_recipient: z.string().trim().min(1, "Nhập tên người nhận").max(120),
  ship_phone: phoneSchema,
  ship_address: z.string().trim().min(1, "Nhập địa chỉ giao hàng").max(500),
  payment_method: z.enum(["cod", "bank_transfer"]),
  note: z.string().trim().max(500).optional(),
});

export type CheckoutForm = z.infer<typeof checkoutSchema>;
