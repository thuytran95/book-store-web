import type { components } from "./api/schema";

export type BookSort = components["schemas"]["BookSort"];

export type BookQuery = {
  text?: string;
  category?: string;
  price_min?: number;
  price_max?: number;
  condition_min?: number;
  in_stock?: boolean;
  sort?: BookSort;
  page: number;
  size: number;
};

export const DEFAULT_PAGE_SIZE = 24;
const SORTS: BookSort[] = ["newest", "price_asc", "price_desc", "relevance"];

type Params = Record<string, string | string[] | undefined> | URLSearchParams;

function get(p: Params, key: string): string | undefined {
  if (p instanceof URLSearchParams) return p.get(key) ?? undefined;
  const v = p[key];
  return Array.isArray(v) ? v[0] : v;
}

function num(v: string | undefined): number | undefined {
  if (v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** URL search params -> BookQuery (works with Next `searchParams` and `URLSearchParams`). */
export function parseBookQuery(p: Params): BookQuery {
  const sort = get(p, "sort") as BookSort | undefined;
  return {
    text: get(p, "text") || undefined,
    category: get(p, "category") || undefined,
    price_min: num(get(p, "price_min")),
    price_max: num(get(p, "price_max")),
    condition_min: num(get(p, "condition_min")),
    in_stock: get(p, "in_stock") === "true" ? true : undefined,
    sort: sort && SORTS.includes(sort) ? sort : undefined,
    page: Math.max(1, Math.trunc(num(get(p, "page")) ?? 1)),
    size: Math.min(100, Math.max(1, Math.trunc(num(get(p, "size")) ?? DEFAULT_PAGE_SIZE))),
  };
}

/** BookQuery -> URL search params, omitting defaults. */
export function toSearchParams(q: Partial<BookQuery>): URLSearchParams {
  const sp = new URLSearchParams();
  const set = (k: string, v: unknown) => {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  };
  set("text", q.text);
  set("category", q.category);
  set("price_min", q.price_min);
  set("price_max", q.price_max);
  set("condition_min", q.condition_min);
  if (q.in_stock) sp.set("in_stock", "true");
  set("sort", q.sort);
  if (q.page && q.page > 1) sp.set("page", String(q.page));
  if (q.size && q.size !== DEFAULT_PAGE_SIZE) sp.set("size", String(q.size));
  return sp;
}

/** BookQuery -> API query params. */
export function toApiQuery(q: BookQuery) {
  return {
    text: q.text,
    category: q.category,
    price_min: q.price_min,
    price_max: q.price_max,
    condition_min: q.condition_min,
    in_stock: q.in_stock,
    sort: q.sort,
    page: q.page,
    size: q.size,
  };
}
