"use client";

import { useEffect, useMemo, useState } from "react";
import { LinkButton } from "@/components/shared/link-button";
import { TablePagination } from "@/components/shared/table-pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MaterialIcon } from "@/features/home/components/material-icon";
import { errorMessage } from "@/lib/error-messages";
import { getPageInfo } from "@/lib/pagination";
import { toast } from "@/lib/toast";
import {
  type BookBulkResult,
  useAdminAuthor,
  useAdminBooks,
  useAdminCategories,
  useBulkBooks,
  useDeleteBook,
  useInventoryOverview,
} from "../../hooks/use-admin";
import { useAdminInventoryFilters } from "../../hooks/use-admin-inventory-filters";
import {
  type AdminInventoryRow,
  STOCK_TABS,
  toAdminInventoryRow,
} from "../../inventory/types";
import { type InventoryBulkAction, InventoryBulkBar } from "./inventory-bulk-bar";
import { InventoryCardList } from "./inventory-card-list";
import { InventoryHeader } from "./inventory-header";
import { InventoryStatusStrip } from "./inventory-status-strip";
import { InventoryTable } from "./inventory-table";
import { InventoryToolbar } from "./inventory-toolbar";

const DELETE_NOTE =
  "Sách đã có đơn hàng sẽ được ẩn thay vì xóa. Sách chưa có đơn sẽ bị xóa vĩnh viễn.";

function bulkDeleteToast({ deleted, hidden }: BookBulkResult): string {
  if (deleted && hidden) return `Đã xóa ${deleted}, ẩn ${hidden} cuốn (có đơn hàng)`;
  if (hidden) return `Đã ẩn ${hidden} cuốn (có đơn hàng)`;
  return `Đã xóa ${deleted} cuốn`;
}

export function InventoryHome() {
  const {
    filters,
    status,
    conditionKey,
    setFilter,
    resetFilters,
    activeCount,
    hasFilters,
  } = useAdminInventoryFilters();
  const [searchInput, setSearchInput] = useState(filters.text ?? "");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  // Single-row delete target, or "bulk" for the selection.
  const [confirming, setConfirming] = useState<AdminInventoryRow | "bulk" | null>(null);

  useEffect(() => {
    setSearchInput(filters.text ?? "");
  }, [filters.text]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (searchInput.trim() !== (filters.text ?? "")) setFilter("q", searchInput.trim());
    }, 300);
    return () => window.clearTimeout(t);
  }, [searchInput, filters.text, setFilter]);

  // Never act on rows the admin can no longer see: reset selection on filter/tab/page change.
  const filtersKey = JSON.stringify(filters);
  useEffect(() => {
    setSelected(new Set());
  }, [filtersKey]);

  const overview = useInventoryOverview();
  const categories = useAdminCategories();
  const books = useAdminBooks(filters);
  const author = useAdminAuthor(filters.author_id);
  const remove = useDeleteBook();
  const bulk = useBulkBooks();

  const rows = useMemo(
    () => (books.data?.items ?? []).map(toAdminInventoryRow),
    [books.data?.items],
  );
  const total = books.data?.total ?? 0;
  const page = filters.page ?? 1;

  const clearSelection = () => setSelected(new Set());

  const toggleRow = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = (ids: number[]) => {
    setSelected((prev) => {
      const allOnPage = ids.every((id) => prev.has(id));
      const next = new Set(prev);
      ids.forEach((id) => (allOnPage ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  const setSelectModeAndClear = (on: boolean) => {
    setSelectMode(on);
    if (!on) clearSelection();
  };

  /** Removing every row of the last page: step back so the list isn't empty. */
  const stepBackIfEmptied = (removed: number) => {
    if (removed >= rows.length && page > 1) setFilter("page", String(page - 1));
  };

  const runBulk = async (action: InventoryBulkAction) => {
    const ids = [...selected];
    try {
      const res = await bulk.mutateAsync({ ids, action });
      if (action === "hide") toast.success(`Đã ẩn ${res.updated} cuốn`);
      else if (action === "show") toast.success(`Đã hiện ${res.updated} cuốn trên shop`);
      else {
        toast.success(bulkDeleteToast(res));
        stepBackIfEmptied(res.deleted);
      }
      clearSelection();
      setSelectMode(false);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const runDelete = async (row: AdminInventoryRow) => {
    try {
      const res = await remove.mutateAsync(row.id);
      toast.success(
        res.hidden ? "Sách đã có đơn hàng nên được ẩn thay vì xóa" : "Đã xóa sách khỏi kho",
      );
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(row.id);
        return next;
      });
      if (res.deleted) stepBackIfEmptied(1);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const onConfirm = async () => {
    if (confirming === "bulk") await runBulk("delete");
    else if (confirming) await runDelete(confirming);
    setConfirming(null);
  };

  const onBulkAction = (action: InventoryBulkAction) => {
    if (action === "delete") setConfirming("bulk");
    else void runBulk(action);
  };

  const setPage = (p: number) => {
    setFilter("page", String(p));
    window.scrollTo({ top: 0 });
  };

  const loading = books.isLoading;
  const empty = !loading && !books.error && rows.length === 0;

  let emptyBlock: React.ReactNode = null;
  if (empty) {
    if (overview.data?.total_titles === 0) {
      emptyBlock = (
        <ListMessage
          icon="inventory_2"
          title="Chưa có sách trong kho"
          body="Sách bạn thêm sẽ hiện ở đây kèm số lượng tồn và trạng thái hiển thị."
          action={
            <LinkButton href="/admin/books/new" className="gap-1">
              <MaterialIcon name="add" className="text-[18px]" />
              Thêm sách đầu tiên
            </LinkButton>
          }
        />
      );
    } else if (hasFilters) {
      emptyBlock = (
        <ListMessage
          icon="search_off"
          title="Không tìm thấy sách phù hợp"
          body="Thử từ khóa khác hoặc bỏ bớt bộ lọc."
          action={<OutlineButton onClick={resetFilters}>Xóa bộ lọc</OutlineButton>}
        />
      );
    } else {
      const tab = STOCK_TABS.find((t) => t.value === status);
      emptyBlock = <ListMessage icon="check" title={tab?.empty ?? "Không có sách"} />;
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col gap-space-lg px-space-md py-space-lg md:px-space-xl">
      <InventoryHeader overview={overview.data} isLoading={overview.isLoading} />

      <InventoryStatusStrip
        overview={overview.data}
        isLoading={overview.isLoading}
        status={status}
        onStatusChange={(s) => setFilter("status", s)}
      />

      <InventoryToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        categorySlug={filters.category ?? ""}
        onCategoryChange={(v) => setFilter("cat", v)}
        conditionKey={conditionKey}
        onConditionChange={(k) => setFilter("cond", k)}
        sort={filters.sort ?? "newest"}
        onSortChange={(v) => setFilter("sort", v === "newest" ? "" : v)}
        categories={categories.data ?? []}
        authorName={filters.author_id ? (author.data?.name ?? "…") : undefined}
        onClearAuthor={() => setFilter("author_id", "")}
        activeCount={activeCount}
        onReset={() => {
          setSearchInput("");
          resetFilters();
        }}
      />

      <section aria-label="Danh sách sách" className="flex flex-col gap-space-md">
        {books.error ? (
          <ListMessage
            icon="cloud_off"
            title="Không tải được danh sách sách"
            body="Kiểm tra kết nối tới máy chủ rồi thử lại."
            action={<OutlineButton onClick={() => void books.refetch()}>Thử lại</OutlineButton>}
          />
        ) : empty ? (
          emptyBlock
        ) : (
          <>
            <div className="hidden md:block">
              <InventoryTable
                rows={rows}
                selectedIds={selected}
                onToggleRow={toggleRow}
                onToggleAll={toggleAll}
                isLoading={loading}
                onDelete={setConfirming}
                onAuthorClick={(id) => setFilter("author_id", String(id))}
              />
            </div>
            <div className="md:hidden">
              <InventoryCardList
                rows={rows}
                total={total}
                selectedIds={selected}
                onToggleRow={toggleRow}
                isLoading={loading}
                onDelete={setConfirming}
                selectMode={selectMode}
                onSelectModeChange={setSelectModeAndClear}
              />
            </div>
          </>
        )}

        <InventoryBulkBar
          selectedCount={selected.size}
          onAction={onBulkAction}
          onClear={() => setSelectModeAndClear(false)}
          pending={bulk.isPending}
        />

        {!loading && !books.error && total > 0 && (
          <TablePagination
            {...getPageInfo(page, filters.size ?? 20, total)}
            setPage={setPage}
            itemLabel="cuốn"
          />
        )}
      </section>

      <ConfirmDialog
        open={confirming !== null}
        onOpenChange={(open) => {
          if (!open) setConfirming(null);
        }}
        title={
          confirming === "bulk"
            ? `Xóa ${selected.size} cuốn khỏi kho?`
            : `Xóa «${confirming?.title ?? ""}» khỏi kho?`
        }
        message={DELETE_NOTE}
        destructive
        cancelLabel="Hủy"
        confirmLabel="Xóa khỏi kho"
        loading={remove.isPending || bulk.isPending}
        onConfirm={() => void onConfirm()}
      />
    </div>
  );
}

function ListMessage({
  icon,
  title,
  body,
  action,
}: {
  icon: string;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-space-sm rounded-lg bg-surface-container-lowest px-space-lg py-space-xl text-center shadow-pod">
      <span className="grid size-14 place-items-center rounded-full bg-surface-container-low text-on-surface-variant">
        <MaterialIcon name={icon} className="text-[28px]" />
      </span>
      <h2 className="text-headline-sm text-on-surface">{title}</h2>
      {body && <p className="max-w-sm text-body-md text-on-surface-variant">{body}</p>}
      {action && <div className="mt-space-xs">{action}</div>}
    </div>
  );
}

function OutlineButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-10 rounded-full border border-outline-variant px-space-md text-label-lg font-semibold text-primary hover:bg-surface-container-low"
    >
      {children}
    </button>
  );
}
