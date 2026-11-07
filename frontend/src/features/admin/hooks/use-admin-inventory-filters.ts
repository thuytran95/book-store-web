"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AdminBookFilters } from "./use-admin";
import {
  CONDITION_FILTER,
  type InventorySort,
  parseConditionKey,
  parseStockTab,
} from "../inventory/types";

const PAGE_SIZE = 20;

function parsePage(raw: string | null): number {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export type InventoryFilterKey = "q" | "cat" | "author_id" | "cond" | "sort" | "page" | "status";

export function useAdminInventoryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const status = parseStockTab(params.get("status"));
  const conditionKey = parseConditionKey(params.get("cond"));

  const filters: AdminBookFilters = useMemo(() => {
    const sort = (params.get("sort") as InventorySort | null) ?? "newest";
    const cond = conditionKey ? CONDITION_FILTER[conditionKey] : undefined;
    return {
      text: params.get("q")?.trim() || undefined,
      category: params.get("cat") || undefined,
      author_id: Number(params.get("author_id")) || undefined,
      condition_min: cond?.min,
      condition_max: cond?.max,
      stock: status || undefined,
      sort: sort as AdminBookFilters["sort"],
      page: parsePage(params.get("page")),
      size: PAGE_SIZE,
    };
  }, [params, conditionKey, status]);

  const setParams = useCallback(
    (patch: Record<string, string | null>, resetPage = false) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      }
      if (resetPage) next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const setFilter = useCallback(
    (key: InventoryFilterKey, value: string) => {
      setParams({ [key]: value || null }, key !== "page");
    },
    [setParams],
  );

  /** "Xóa bộ lọc": clears keyword, category, condition, author; keeps the status tab and sort. */
  const resetFilters = useCallback(() => {
    setParams({ q: null, cat: null, cond: null, author_id: null }, true);
  }, [setParams]);

  const activeCount =
    [filters.category, conditionKey, filters.author_id].filter(Boolean).length +
    (filters.sort && filters.sort !== "newest" ? 1 : 0);

  const hasFilters = Boolean(
    filters.text || filters.category || conditionKey || filters.author_id,
  );

  return {
    filters,
    status,
    conditionKey,
    setFilter,
    resetFilters,
    setParams,
    activeCount,
    hasFilters,
  };
}
