import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên thể loại")
    .max(120, "Tên thể loại tối đa 120 ký tự"),
});

export type CategoryForm = z.infer<typeof categorySchema>;
