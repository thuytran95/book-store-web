"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AdminOrderFilters, OrderSort, OrderStatus } from "./use-admin";

const PAGE_SIZE = 20;

const STATUSES: readonly OrderStatus[] = [
  "pending",
  "confirmed",
  "shipping",
  "completed",
  "cancelled",
];
const SORTS: readonly OrderSort[] = ["newest", "oldest", "total_desc"];

function parseStatus(raw: string | null): OrderStatus | undefined {
  return STATUSES.includes(raw as OrderStatus) ? (raw as OrderStatus) : undefined;
}

function parseSort(raw: string | null): OrderSort {
  return SORTS.includes(raw as OrderSort) ? (raw as OrderSort) : "newest";
}

function parsePositive(raw: string | null): number | undefined {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : undefined;
}

export type OrderFilterKey = "status" | "q" | "sort" | "page";

/**
 * Admin orders list state in the URL: `status`, `q`, `sort` (omitted when `newest`), `page`,
 * and `order` (id of the order open in the drawer).
 */
export function useAdminOrderFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const filters: AdminOrderFilters = useMemo(
    () => ({
      status: parseStatus(params.get("status")),
      q: params.get("q")?.trim() || undefined,
      sort: parseSort(params.get("sort")),
      page: parsePositive(params.get("page")) ?? 1,
      size: PAGE_SIZE,
    }),
    [params],
  );

  const openId = parsePositive(params.get("order"));

  const setParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  /** Several keys in one URL update. Any key but `page` resets paging. Never touches `order`. */
  const setFilters = useCallback(
    (patch: Partial<Record<OrderFilterKey, string | number | null | undefined>>) => {
      const next: Record<string, string | null> = {};
      for (const [key, value] of Object.entries(patch)) {
        let v = value == null ? null : String(value);
        if (key === "sort" && v === "newest") v = null;
        if (key === "page" && v === "1") v = null;
        next[key] = v;
      }
      if (!("page" in patch)) next.page = null;
      setParams(next);
    },
    [setParams],
  );

  const setFilter = useCallback(
    (key: OrderFilterKey, value: string | number | null | undefined) =>
      setFilters({ [key]: value }),
    [setFilters],
  );

  const openOrder = useCallback((id: number) => setParams({ order: String(id) }), [setParams]);
  const closeOrder = useCallback(() => setParams({ order: null }), [setParams]);

  return { filters, openId, setFilter, setFilters, openOrder, closeOrder };
}
