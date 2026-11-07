"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AdminBookFilters } from "../hooks/use-admin";
import { CONDITION_FILTER_MIN, type InventorySort } from "../inventory/types";

function parsePage(raw: string | null): number {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export function useAdminInventoryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const filters: AdminBookFilters = useMemo(() => {
    const condKey = params.get("cond") ?? "";
    const sort = (params.get("sort") as InventorySort | null) ?? "newest";
    return {
      text: params.get("q")?.trim() || undefined,
      category: params.get("cat") || undefined,
      author_id: Number(params.get("author_id")) || undefined,
      condition_min: CONDITION_FILTER_MIN[condKey],
      sort: sort as AdminBookFilters["sort"],
      page: parsePage(params.get("page")),
      size: 20,
    };
  }, [params]);

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
    (key: "q" | "cat" | "author_id" | "cond" | "sort" | "page", value: string) => {
      setParams({ [key]: value || null }, key !== "page");
    },
    [setParams],
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  return { filters, setFilter, resetFilters, setParams };
}
