import { z } from "zod";

export const checkoutSchema = z.object({
  address_id: z.number({ error: "Choose a delivery address" }).int().positive("Choose a delivery address"),
  payment_method: z.enum(["cod", "bank_transfer"]),
  note: z.string().trim().max(500).optional(),
});

export type CheckoutForm = z.infer<typeof checkoutSchema>;
