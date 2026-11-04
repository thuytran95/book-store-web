import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(0|\+84)\d{9,10}$/, "Invalid phone number");

export const emailSchema = z.email("Invalid email");
export const passwordSchema = z.string().min(8, "At least 8 characters").max(72);

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: z.string().trim().min(1, "Required").max(120),
  phone: phoneSchema.optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Required"),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  new_password: passwordSchema,
});

export type RegisterForm = z.infer<typeof registerSchema>;
export type LoginForm = z.infer<typeof loginSchema>;
