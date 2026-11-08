"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AdminUserFilters, UserStatusFilter } from "./use-admin";

const PAGE_SIZE = 20;

const STATUSES: readonly UserStatusFilter[] = ["active", "locked"];

function parseStatus(raw: string | null): UserStatusFilter | undefined {
  return STATUSES.includes(raw as UserStatusFilter) ? (raw as UserStatusFilter) : undefined;
}

function parsePage(raw: string | null): number {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export type UserFilterKey = "status" | "q" | "page";

/** Admin users list state in the URL: `status` (`active`/`locked`, empty = all), `q`, `page`. */
export function useAdminUserFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const filters: AdminUserFilters = useMemo(
    () => ({
      status: parseStatus(params.get("status")),
      q: params.get("q")?.trim() || undefined,
      page: parsePage(params.get("page")),
      size: PAGE_SIZE,
    }),
    [params],
  );

  /** Any key but `page` resets paging. */
  const setFilter = useCallback(
    (key: UserFilterKey, value: string | number | null | undefined) => {
      const next = new URLSearchParams(params.toString());
      let v = value == null ? "" : String(value);
      if (key === "page" && v === "1") v = "";
      if (v) next.set(key, v);
      else next.delete(key);
      if (key !== "page") next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  return { filters, setFilter };
}
