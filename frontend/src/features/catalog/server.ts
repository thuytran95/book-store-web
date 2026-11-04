import { cache } from "react";
import { ApiError } from "@/lib/api/errors";
import { publicApi } from "@/lib/api/server";
import { toApiQuery, type BookQuery, DEFAULT_PAGE_SIZE } from "@/lib/book-query";

/** Server-side data helpers for catalog Server Components (cached, cookie-free). */

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

/** Home page data: categories + newest in-stock books. */
export const getHomeData = cache(async () => {
  const [categories, newest] = await Promise.all([getCategories(), getNewestBooks(12)]);
  return { categories, newest };
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

export { DEFAULT_PAGE_SIZE };
