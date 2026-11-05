/** Pure pagination math, shared by the pagination hooks and components. Pages are 1-based. */

export type PageItem = number | "…";

export type PageInfo = {
  /** Current page, clamped to `1..pageCount`. */
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  /** 1-based index of the first item on the page (0 when there are no items). */
  start: number;
  /** 1-based index of the last item on the page (0 when there are no items). */
  end: number;
  /** 0-based offset of the first item, for `slice(offset, offset + pageSize)` or an API `offset`. */
  offset: number;
};

export function getPageCount(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

/** Clamps `page` and derives the item range shown on it. */
export function getPageInfo(page: number, pageSize: number, total: number): PageInfo {
  const pageCount = getPageCount(total, pageSize);
  const current = Math.min(Math.max(1, page), pageCount);
  const offset = (current - 1) * pageSize;
  return {
    page: current,
    pageCount,
    total,
    pageSize,
    start: total === 0 ? 0 : offset + 1,
    end: Math.min(offset + pageSize, total),
    offset,
  };
}

/** Page buttons to render: all pages up to 7, otherwise first, last, neighbours of `page` and gaps. */
export function getPageWindow(page: number, pageCount: number): PageItem[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages: PageItem[] = [1];
  if (page > 3) pages.push("…");
  for (let p = Math.max(2, page - 1); p <= Math.min(pageCount - 1, page + 1); p++) pages.push(p);
  if (page < pageCount - 2) pages.push("…");
  pages.push(pageCount);
  return pages;
}
