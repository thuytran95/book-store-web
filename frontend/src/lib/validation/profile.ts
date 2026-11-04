import { z } from "zod";
import { phoneSchema } from "./auth";

export const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Required").max(120),
  phone: phoneSchema.or(z.literal("")),
});

export type ProfileForm = z.infer<typeof profileSchema>;
