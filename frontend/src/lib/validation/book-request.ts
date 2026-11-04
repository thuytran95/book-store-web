import { z } from "zod";

export const bookRequestSchema = z.object({
  title: z.string().trim().min(1, "Required").max(255),
  author: z.string().trim().max(255).optional(),
  note: z.string().max(2000).optional(),
});

export type BookRequestForm = z.infer<typeof bookRequestSchema>;
