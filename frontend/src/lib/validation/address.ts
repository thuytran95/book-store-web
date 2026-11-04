import { z } from "zod";
import { phoneSchema } from "./auth";

export const addressSchema = z.object({
  recipient: z.string().trim().min(1, "Required").max(120),
  phone: phoneSchema,
  line: z.string().trim().min(1, "Required").max(255),
  ward: z.string().trim().min(1, "Required").max(100),
  district: z.string().trim().min(1, "Required").max(100),
  province: z.string().trim().min(1, "Required").max(100),
  is_default: z.boolean(),
});

export type AddressForm = z.infer<typeof addressSchema>;
