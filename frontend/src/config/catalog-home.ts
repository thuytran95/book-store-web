import type { BookQuery } from "@/lib/book-query";

/** Home showcase tabs → `GET /api/v1/books` query (see docs/spec/api/catalog-home.md). */
export const HOME_BOOK_TABS = [
  { id: "featured", label: "Sách Nổi Bật" },
  { id: "newest", label: "Mới Về Hôm Nay" },
  { id: "rare", label: "Ấn Bản Quý Hiếm" },
  { id: "under100k", label: "Sách Dưới 100k" },
] as const;

export type HomeBookTabId = (typeof HOME_BOOK_TABS)[number]["id"];

/** Rare-edition price floor (VND); tune here without API changes. */
export const HOME_RARE_PRICE_MIN = 500_000;

export function homeBookQuery(tabId: HomeBookTabId): BookQuery {
  switch (tabId) {
    case "featured":
      return { sort: "newest", in_stock: true, page: 1, size: 8 };
    case "newest":
      return { sort: "newest", in_stock: true, page: 2, size: 8 };
    case "rare":
      return {
        sort: "price_desc",
        in_stock: true,
        page: 1,
        size: 8,
        price_min: HOME_RARE_PRICE_MIN,
      };
    case "under100k":
      return { sort: "price_asc", in_stock: true, page: 1, size: 8, price_max: 100_000 };
    default: {
      const _exhaustive: never = tabId;
      return _exhaustive;
    }
  }
}