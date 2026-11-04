"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { homeBookQuery, HOME_BOOK_TABS, type HomeBookTabId } from "@/config/catalog-home";
import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { toApiQuery } from "@/lib/book-query";

export type BookPage = components["schemas"]["Page_BookCard_"];

export function useHomeBookTabs(initialTabId: HomeBookTabId, initialBooks: BookPage) {
  const [activeTabId, setActiveTabId] = useState<HomeBookTabId>(initialTabId);

  const query = useQuery({
    queryKey: ["home-books", activeTabId],
    queryFn: async () => {
      const q = homeBookQuery(activeTabId);
      const { data } = await api.GET("/api/v1/books", { params: { query: toApiQuery(q) } });
      return data ?? { items: [], total: 0, page: q.page, size: q.size };
    },
    initialData: activeTabId === initialTabId ? initialBooks : undefined,
  });

  return {
    tabs: HOME_BOOK_TABS,
    activeTabId,
    setActiveTabId,
    books: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isFetching: query.isFetching,
  };
}
