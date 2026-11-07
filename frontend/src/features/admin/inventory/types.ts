import type { components } from "@/lib/api/schema";
import { formatStockCode } from "@/lib/format";

type BookAdminRead = components["schemas"]["BookAdminRead"];
type AuthorRef = components["schemas"]["AuthorRef"];

export type AdminInventoryRow = {
  id: number;
  stockCode: string;
  title: string;
  slug: string;
  author: string | null;
  authors: AuthorRef[];
  coverUrl: string | null;
  categoryName: string;
  conditionPct: number;
  salePrice: number;
  quantity: number;
  /** Copies held by pending orders (`quantity − available`). */
  pending: number;
  isVisible: boolean;
};

export function toAdminInventoryRow(book: BookAdminRead): AdminInventoryRow {
  return {
    id: book.id,
    stockCode: formatStockCode(book.id),
    title: book.title,
    slug: book.slug,
    author: book.author,
    authors: book.authors,
    coverUrl: book.cover_url ?? book.images[0]?.url ?? null,
    categoryName: book.category.name,
    conditionPct: book.condition_pct,
    salePrice: book.price,
    quantity: book.quantity,
    pending: Math.max(0, book.quantity - book.available),
    isVisible: book.is_visible,
  };
}

// ---------------------------------------------------------------- Status tabs

export type StockTab = "" | "in_stock" | "out_of_stock" | "hidden";

export const STOCK_TABS: {
  value: StockTab;
  label: string;
  dot: string;
  empty: string;
}[] = [
  { value: "", label: "Tất cả", dot: "", empty: "Chưa có sách trong kho" },
  {
    value: "in_stock",
    label: "Còn hàng",
    dot: "bg-secondary",
    empty: "Không có sách còn hàng",
  },
  {
    value: "out_of_stock",
    label: "Hết hàng",
    dot: "bg-destructive",
    empty: "Không có sách hết hàng",
  },
  {
    value: "hidden",
    label: "Đang ẩn",
    dot: "bg-outline",
    empty: "Không có sách đang ẩn",
  },
];

export function parseStockTab(raw: string | null): StockTab {
  return STOCK_TABS.some((t) => t.value === raw) ? (raw as StockTab) : "";
}

// ---------------------------------------------------------------- Condition buckets

export type ConditionKey = "mint" | "good" | "fair" | "old";

export const CONDITION_FILTER: Record<
  ConditionKey,
  { min?: number; max?: number; label: string }
> = {
  mint: { min: 95, label: "Rất mới (≥95%)" },
  good: { min: 80, max: 94, label: "Tốt (≥80%)" },
  fair: { min: 60, max: 79, label: "Khá (≥60%)" },
  old: { max: 59, label: "Cũ (<60%)" },
};

/** Legacy URL keys still accepted in `?cond=`. */
export const CONDITION_ALIASES: Record<string, ConditionKey> = { vintage: "old" };

export function parseConditionKey(raw: string | null): ConditionKey | "" {
  if (!raw) return "";
  if (raw in CONDITION_FILTER) return raw as ConditionKey;
  return CONDITION_ALIASES[raw] ?? "";
}

// ---------------------------------------------------------------- Sort

export type InventorySort =
  | "newest"
  | "title_asc"
  | "price_asc"
  | "price_desc"
  | "condition_desc";

export const SORT_OPTIONS: { value: InventorySort; label: string }[] = [
  { value: "newest", label: "Mới nhập gần đây" },
  { value: "title_asc", label: "Tên sách A–Z" },
  { value: "price_asc", label: "Giá thấp đến cao" },
  { value: "price_desc", label: "Giá cao đến thấp" },
  { value: "condition_desc", label: "Tình trạng tốt nhất" },
];
