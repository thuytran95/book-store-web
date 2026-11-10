import { cache } from "react";
import { homeBookQuery, type HomeBookTabId } from "@/config/catalog-home";
import { ApiError } from "@/lib/api/errors";
import { publicApi } from "@/lib/api/server";
import { toApiQuery, type BookQuery, DEFAULT_PAGE_SIZE } from "@/lib/book-query";

/** Server-side data helpers for catalog Server Components (cookie-free; books are never cached so admin edits show immediately). */

export const getCategories = cache(async () => {
  const { data } = await publicApi(300).GET("/api/v1/categories");
  return data ?? [];
});

export const getBooks = cache(async (q: BookQuery) => {
  const { data } = await publicApi().GET("/api/v1/books", { params: { query: toApiQuery(q) } });
  return data ?? { items: [], total: 0, page: q.page, size: q.size };
});

export const getNewestBooks = (size = 12) =>
  getBooks({ sort: "newest", page: 1, size, in_stock: true });

export const getHomeBookTab = (tabId: HomeBookTabId) => getBooks(homeBookQuery(tabId));

/** Shop home (`/`): categories + default showcase tab books (+ optional hero fallback). */
export const getHomeData = cache(async () => {
  const [categories, defaultTabBooks, heroBooks] = await Promise.all([
    getCategories(),
    getHomeBookTab("featured"),
    getNewestBooks(3),
  ]);
  return { categories, defaultTabBooks, heroBooks };
});

/** Returns null when the book does not exist (use with `notFound()`). */
export const getBook = cache(async (slug: string) => {
  try {
    const { data } = await publicApi().GET("/api/v1/books/{slug}", { params: { path: { slug } } });
    return data ?? null;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
});

/** Same-category in-stock books for the related row (excludes current id). */
export const getRelatedBooks = cache(async (bookId: number, categorySlug: string) => {
  const page = await getBooks({
    category: categorySlug,
    page: 1,
    size: 4,
    in_stock: true,
    sort: "newest",
  });
  return page.items.filter((b) => b.id !== bookId);
});

export { DEFAULT_PAGE_SIZE };
