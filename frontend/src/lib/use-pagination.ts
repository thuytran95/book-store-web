"use client";

import { useMemo, useState } from "react";
import { getPageInfo, type PageInfo } from "./pagination";

export type Pagination = PageInfo & { setPage: (page: number) => void };

/**
 * Page state for a list of `total` items. The page is clamped, so it stays valid when the list
 * shrinks (e.g. after deleting the last item of the last page). Use with server paging by passing
 * the API `total` and sending `page` / `pageSize` in the request.
 */
export function usePagination({
  total,
  pageSize = 10,
  initialPage = 1,
}: {
  total: number;
  pageSize?: number;
  initialPage?: number;
}): Pagination {
  const [page, setPage] = useState(initialPage);
  const info = getPageInfo(page, pageSize, total);
  return { ...info, setPage };
}

/** Client-side paging for a list that is already loaded. Returns the items of the current page. */
export function useClientPagination<T>(
  items: readonly T[] | undefined,
  pageSize = 10,
): Pagination & { pageItems: T[] } {
  const pagination = usePagination({ total: items?.length ?? 0, pageSize });
  const { offset } = pagination;
  const pageItems = useMemo(
    () => (items ?? []).slice(offset, offset + pageSize),
    [items, offset, pageSize],
  );
  return { ...pagination, pageItems };
}
