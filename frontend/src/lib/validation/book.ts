import { z } from "zod";

const emptyToUndef = (v: unknown) => (v === "" || v === null || Number.isNaN(v) ? undefined : v);

export const bookSchema = z.object({
  category_id: z.coerce.number().int().positive("Chọn danh mục"),
  title: z.string().trim().min(1, "Bắt buộc").max(255),
  author: z.preprocess(emptyToUndef, z.string().trim().max(255).optional()),
  publisher: z.preprocess(emptyToUndef, z.string().trim().max(255).optional()),
  published_year: z.preprocess(
    emptyToUndef,
    z.coerce.number().int().min(1000).max(2100).optional(),
  ),
  cost_price: z.coerce.number().int().min(0),
  sale_price: z.coerce.number().int().min(0),
  condition_pct: z.coerce.number().int().min(10).max(100),
  description: z.preprocess(emptyToUndef, z.string().optional()),
  quantity: z.coerce.number().int().min(0),
  is_visible: z.boolean(),
});

export type BookForm = z.infer<typeof bookSchema>;
