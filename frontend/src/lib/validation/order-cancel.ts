import { z } from "zod";

// Mirrors backend `TransitionIn.reason` (optional, max 1000).
export const orderCancelSchema = z.object({
  reason: z.string().trim().max(1000, "Tối đa 1000 ký tự"),
});

export type OrderCancelForm = z.infer<typeof orderCancelSchema>;
