import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Required").max(120),
});

export type CategoryForm = z.infer<typeof categorySchema>;
