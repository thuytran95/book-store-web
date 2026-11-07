import { z } from "zod";

export const authorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên tác giả")
    .max(160, "Tên tác giả tối đa 160 ký tự"),
  bio: z.string().trim().optional(),
});

export type AuthorForm = z.infer<typeof authorSchema>;
