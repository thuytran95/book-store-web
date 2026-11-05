import type { components } from "@/lib/api/schema";
import { formatStockCode } from "@/lib/format";

type BookAdminRead = components["schemas"]["BookAdminRead"];

export type ShelfStatus = "on_shelf" | "held" | "sold" | "hidden";

export type AdminInventoryRow = {
  id: number;
  stockCode: string;
  title: string;
  author: string | null;
  publisher: string | null;
  publishedYear: number | null;
  coverUrl: string | null;
  categoryName: string;
  conditionPct: number;
  conditionNote: string | null;
  salePrice: number;
  shelfStatus: ShelfStatus;
  slug: string;
};

export function shelfStatusForBook(
  book: BookAdminRead,
  heldBookIds: ReadonlySet<number>,
): ShelfStatus {
  if (!book.is_visible) return "hidden";
  if (heldBookIds.has(book.id)) return "held";
  if (book.quantity === 0) return "sold";
  return "on_shelf";
}

export function toAdminInventoryRow(
  book: BookAdminRead,
  heldBookIds: ReadonlySet<number>,
): AdminInventoryRow {
  return {
    id: book.id,
    stockCode: formatStockCode(book.id),
    title: book.title,
    author: book.author,
    publisher: book.publisher,
    publishedYear: book.published_year,
    coverUrl: book.cover_url ?? book.images[0]?.url ?? null,
    categoryName: book.category.name,
    conditionPct: book.condition_pct,
    conditionNote: book.description,
    salePrice: book.sale_price,
    shelfStatus: shelfStatusForBook(book, heldBookIds),
    slug: book.slug,
  };
}

export const CONDITION_FILTER_MIN: Record<string, number | undefined> = {
  "": undefined,
  mint: 95,
  good: 80,
  fair: 60,
  vintage: 10,
};

export type InventorySort =
  | "newest"
  | "title_asc"
  | "price_asc"
  | "price_desc"
  | "condition_desc";

export const SORT_OPTIONS: { value: InventorySort; label: string }[] = [
  { value: "newest", label: "Mới nhập gần đây" },
  { value: "title_asc", label: "Tựa sách (A-Z)" },
  { value: "price_asc", label: "Giá bán (Thấp → Cao)" },
  { value: "price_desc", label: "Giá bán (Cao → Thấp)" },
  { value: "condition_desc", label: "Tình trạng tốt nhất" },
];
