"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { parseBookQuery, toApiQuery, toSearchParams, type BookQuery } from "@/lib/book-query";

export type BookPage = components["schemas"]["Page_BookCard_"];

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/categories");
      return data ?? [];
    },
  });
}

/**
 * Filters live in the URL. `setFilters` merges and resets to page 1 (unless `page` is given).
 * Text input should call `setText` (debounced) instead of `setFilters`.
 */
export function useBookQuery(
  basePath?: string,
  /** Server-fetched first page; used only while the URL still matches `initial.query`. */
  initial?: { query: BookQuery; data: BookPage },
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseBookQuery(searchParams), [searchParams]);

  const push = useCallback(
    (next: BookQuery) => {
      const qs = toSearchParams(next).toString();
      const path = basePath ?? pathname;
      router.replace(qs ? `${path}?${qs}` : path, { scroll: false });
    },
    [router, pathname, basePath],
  );

  const setFilters = useCallback(
    (patch: Partial<BookQuery>) => push({ ...filters, page: 1, ...patch }),
    [filters, push],
  );

  const setPage = useCallback((page: number) => push({ ...filters, page }), [filters, push]);

  // Debounced text box state, synced from URL when it changes externally.
  const [textInput, setTextInput] = useState(filters.text ?? "");
  useEffect(() => setTextInput(filters.text ?? ""), [filters.text]);
  useEffect(() => {
    if ((filters.text ?? "") === textInput.trim()) return;
    const id = setTimeout(() => setFilters({ text: textInput.trim() || undefined }), 350);
    return () => clearTimeout(id);
  }, [textInput, filters.text, setFilters]);

  const query = useQuery({
    queryKey: ["books", filters],
    placeholderData: keepPreviousData,
    initialData:
      initial && JSON.stringify(initial.query) === JSON.stringify(filters) ? initial.data : undefined,
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/books", { params: { query: toApiQuery(filters) } });
      return data!;
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    filters,
    setFilters,
    page: filters.page,
    setPage,
    textInput,
    setTextInput,
    reset: () => push({ page: 1, size: filters.size }),
  };
}

export function useBook(slug: string) {
  return useQuery({
    queryKey: ["book", slug],
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/books/{slug}", { params: { path: { slug } } });
      return data!;
    },
  });
}
