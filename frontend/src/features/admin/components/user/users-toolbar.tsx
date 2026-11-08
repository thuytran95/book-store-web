"use client";

import { useEffect, useRef, useState } from "react";
import { MaterialIcon } from "@/features/home/components/material-icon";
import type { components } from "@/lib/api/schema";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "../../hooks/use-admin";

type UserCounts = components["schemas"]["UserCounts"];
type UserStatusFilter = components["schemas"]["UserStatusFilter"];
type TabKey = UserStatusFilter | "";

const TABS: { key: TabKey; label: string; count: keyof UserCounts }[] = [
  { key: "", label: "Tất cả", count: "all" },
  { key: "active", label: "Đang hoạt động", count: "active" },
  { key: "locked", label: "Đã khóa", count: "locked" },
];

export function UsersToolbar({
  status,
  onStatusChange,
  counts,
  isLoading,
  q,
  onSearch,
}: {
  status: UserStatusFilter | undefined;
  onStatusChange: (s: UserStatusFilter | undefined) => void;
  counts: UserCounts | undefined;
  isLoading: boolean;
  /** Applied keyword from the URL. */
  q: string | undefined;
  onSearch: (q: string) => void;
}) {
  const current: TabKey = status ?? "";
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [input, setInput] = useState(q ?? "");
  const debounced = useDebouncedValue(input.trim(), 300);

  // Keep the input in sync when `q` changes from outside ("Xóa từ khóa", back button).
  useEffect(() => {
    setInput(q ?? "");
  }, [q]);

  useEffect(() => {
    if (debounced !== (q ?? "")) onSearch(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the debounced value
  }, [debounced]);

  const select = (key: TabKey) => onStatusChange(key || undefined);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (index + (e.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length;
    select(TABS[next].key);
    tabRefs.current[next]?.focus();
  };

  return (
    <section
      aria-label="Lọc và tìm kiếm"
      className="flex flex-col gap-space-sm md:flex-row md:items-center md:gap-space-md"
    >
      <div
        role="tablist"
        aria-label="Lọc theo trạng thái tài khoản"
        className="-m-1 flex shrink-0 gap-space-xs overflow-x-auto p-1 [scrollbar-width:none] md:m-0 md:rounded-full md:bg-surface-container-lowest md:shadow-pod [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map((t, i) => {
          const selected = current === t.key;
          const n = counts?.[t.count];
          const hotLocked = t.key === "locked" && !!n && !selected;
          return (
            <button
              key={t.key || "all"}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(t.key)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-space-md text-label-lg transition-colors md:h-9",
                selected
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-lowest text-on-surface-variant shadow-pod hover:bg-surface-container-low md:bg-transparent md:shadow-none",
              )}
            >
              {t.key === "locked" && <MaterialIcon name="lock" className="text-[16px]" />}
              {t.label}
              {!isLoading && n !== undefined && (
                <span
                  className={cn(
                    "tabular-nums",
                    selected
                      ? "text-on-primary/80"
                      : hotLocked
                        ? "text-destructive"
                        : "text-on-surface-variant/80",
                  )}
                >
                  {n}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Tìm người dùng</span>
        <MaterialIcon
          name="search"
          className="pointer-events-none absolute left-space-md top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant"
        />
        <input
          type="search"
          autoComplete="off"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tìm theo tên, email hoặc số điện thoại"
          className="h-11 w-full rounded-full bg-surface-container-lowest pl-11 pr-4 text-body-md text-on-surface shadow-pod outline-none transition-shadow placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/20"
        />
      </label>
    </section>
  );
}
