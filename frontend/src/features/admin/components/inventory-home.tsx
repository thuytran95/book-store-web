"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MaterialIcon } from "@/features/home/components/material-icon";
import { errorMessage } from "@/lib/error-messages";
import { formatCompactCount } from "@/lib/format";
import { toast } from "@/lib/toast";
import { useAdminInventoryFilters } from "../hooks/use-admin-inventory-filters";
import {
  useAdminBooks,
  useAdminCategories,
  useAdminReservations,
  useDeleteBook,
  useInventoryOverview,
  useMarkSold,
} from "../hooks/use-admin";
import { toAdminInventoryRow } from "../inventory/types";
import { InventoryBatchFooter } from "./inventory-batch-footer";
import { InventoryKpiCard } from "./inventory-kpi-card";
import { InventoryTable } from "./inventory-table";
import { InventoryToolbar } from "./inventory-toolbar";

export function InventoryHome() {
  const router = useRouter();
  const { filters, setFilter } = useAdminInventoryFilters();
  const [searchInput, setSearchInput] = useState(filters.text ?? "");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);
  const [soldTarget, setSoldTarget] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  useEffect(() => {
    setSearchInput(filters.text ?? "");
  }, [filters.text]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (searchInput !== (filters.text ?? "")) setFilter("q", searchInput);
    }, 300);
    return () => window.clearTimeout(t);
  }, [searchInput, filters.text, setFilter]);

  const overview = useInventoryOverview();
  const categories = useAdminCategories();
  const books = useAdminBooks(filters);
  const reservations = useAdminReservations("active", 1);
  const remove = useDeleteBook();
  const sold = useMarkSold();

  const heldIds = useMemo(() => {
    const set = new Set<number>();
    for (const r of reservations.data?.items ?? []) set.add(r.book_id);
    return set;
  }, [reservations.data?.items]);

  const rows = useMemo(
    () => (books.data?.items ?? []).map((b) => toAdminInventoryRow(b, heldIds)),
    [books.data?.items, heldIds],
  );

  const pageCount = books.data ? Math.max(1, Math.ceil(books.data.total / books.data.size)) : 1;
  const page = filters.page ?? 1;
  const total = books.data?.total ?? overview.data?.total_titles ?? 0;

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
      if (allOnPage) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const runBatchDelete = async () => {
    const ids = [...selected];
    for (const id of ids) {
      try {
        await remove.mutateAsync(id);
      } catch (e) {
        toast.error(errorMessage(e));
      }
    }
    toast.success(`Đã xử lý ${ids.length} cuốn`);
    setSelected(new Set());
    setBatchDeleteOpen(false);
  };

  const ov = overview.data;

  return (
    <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-space-lg px-space-xl py-space-lg">
      <div className="flex flex-col justify-between gap-space-md lg:flex-row lg:items-end">
        <div className="space-y-space-xs">
          <nav className="flex items-center gap-space-xs text-label-sm text-on-surface-variant">
            <span className="flex items-center gap-1">
              <MaterialIcon name="store" className="text-[14px]" />
              Quản lý cửa hàng
            </span>
            <span className="text-outline-variant">/</span>
            <span className="font-semibold text-primary">Kho sách cũ</span>
          </nav>
          <div className="pt-1">
            <h1 className="text-headline-xl tracking-tight text-primary">Quản lý sách</h1>
            <p className="mt-1 max-w-3xl text-body-md text-on-surface-variant">
              {ov
                ? `Theo dõi ${formatCompactCount(ov.total_copies)} đầu sách xưa và nay, quản lý tình trạng hao mòn, định giá và kệ trưng bày.`
                : "Theo dõi kho sách cũ và quản lý trưng bày."}
            </p>
          </div>
        </div>
        <Link
          href="/admin/books/new"
          className="inline-flex items-center gap-space-xs self-start rounded-full bg-primary-container px-space-lg py-2.5 text-label-md text-on-primary shadow-[0_8px_24px_-4px_rgba(27,77,62,0.18)] transition-all hover:bg-primary lg:self-auto"
        >
          Thêm sách mới vào kho
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-4">
        <InventoryKpiCard
          isLoading={overview.isLoading}
          label="Tổng số sách trong kho"
          icon="menu_book"
          value={
            ov ? (
              <>
                {formatCompactCount(ov.total_copies)}{" "}
                <span className="text-headline-sm font-normal text-on-surface-variant">cuốn</span>
              </>
            ) : null
          }
          footer={
            ov ? (
              <div className="flex items-center gap-space-xs">
                <span className="inline-flex items-center gap-0.5 rounded-full bg-secondary-container px-2 py-0.5 text-label-sm text-on-secondary-container">
                  <MaterialIcon name="trending_up" className="text-[13px]" />+{ov.intake_this_week} cuốn
                </span>
                <span className="text-body-sm text-on-surface-variant">nhập kho trong tuần này</span>
              </div>
            ) : null
          }
        />
        <InventoryKpiCard
          isLoading={overview.isLoading}
          accent="secondary"
          label="Tổng số thể loại sách"
          icon="account_tree"
          value={
            ov ? (
              <>
                <span className="text-secondary">{formatCompactCount(ov.category_count)}</span>{" "}
                <span className="text-headline-sm font-normal text-on-surface-variant">danh mục</span>
              </>
            ) : null
          }
          footer={
            ov ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-body-sm">
                  <span className="text-on-surface-variant">
                    {formatCompactCount(ov.total_copies)} / {formatCompactCount(ov.total_copies)} cuốn
                  </span>
                  <span className="font-label-sm font-semibold text-secondary">
                    {ov.categorized_pct}% sách đã gắn thể loại
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-container">
                  <div
                    className="h-full rounded-full bg-secondary transition-all"
                    style={{ width: `${Math.min(100, ov.categorized_pct)}%` }}
                  />
                </div>
              </div>
            ) : null
          }
        />
        <InventoryKpiCard
          isLoading={overview.isLoading}
          accent="tertiary"
          label="Ước tính giá trị lưu kho"
          icon="payments"
          value={
            ov ? (
              <>
                {(ov.estimated_stock_value / 1_000_000).toFixed(1)}{" "}
                <span className="text-headline-sm font-normal text-on-surface-variant">triệu đ</span>
              </>
            ) : null
          }
          footer={
            <div className="flex items-center gap-space-xs text-body-sm text-on-surface-variant">
              <MaterialIcon name="verified" className="text-[16px] text-tertiary-fixed-dim" />
              Dựa trên giá vốn × số lượng tồn
            </div>
          }
        />
        <InventoryKpiCard
          isLoading={overview.isLoading}
          label="Tình trạng tốt (≥80%)"
          icon="auto_fix_high"
          value={
            ov ? (
              <>
                {formatCompactCount(ov.good_condition_copies)}{" "}
                <span className="text-headline-sm font-normal text-on-surface-variant">cuốn</span>
              </>
            ) : null
          }
          footer={
            ov ? (
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant">Chiếm {ov.good_condition_pct}% tổng kho</span>
                <span className="rounded-full bg-surface-container px-2 py-0.5 text-label-sm font-semibold text-primary">
                  Luân chuyển cao
                </span>
              </div>
            ) : null
          }
        />
      </div>

      <InventoryToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        categorySlug={filters.category ?? ""}
        onCategoryChange={(v) => setFilter("cat", v)}
        conditionKey={
          filters.condition_min === 95
            ? "mint"
            : filters.condition_min === 80
              ? "good"
              : filters.condition_min === 60
                ? "fair"
                : filters.condition_min === 10
                  ? "vintage"
                  : ""
        }
        onConditionChange={(k) => setFilter("cond", k)}
        sort={filters.sort ?? "newest"}
        onSortChange={(v) => setFilter("sort", v)}
        categories={categories.data ?? []}
        filteredCount={rows.length}
        total={total}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="overflow-hidden rounded-lg bg-surface-container-lowest shadow-[0_8px_24px_-4px_rgba(27,77,62,0.06)]">
        <InventoryTable
          rows={rows}
          selectedIds={selected}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
          isLoading={books.isLoading}
          error={books.error}
          onEdit={(id) => router.push(`/admin/books/${id}`)}
          onMarkSold={(id) => setSoldTarget(id)}
          onPrint={() => toast("In tem mã vạch — sắp có")}
        />
        <InventoryBatchFooter
          selectedCount={selected.size}
          onBatchDiscount={() => toast("Cập nhật giảm giá hàng loạt — chưa hỗ trợ")}
          onBatchDelete={() => setBatchDeleteOpen(true)}
          page={page}
          pageCount={pageCount}
          total={total}
          pageSize={filters.size ?? 20}
          onPageChange={(p) => setFilter("page", String(p))}
        />
      </div>

      <ConfirmDialog
        open={batchDeleteOpen}
        onOpenChange={setBatchDeleteOpen}
        title="Xóa khỏi kho?"
        message={`Xóa hoặc ẩn ${selected.size} cuốn đã chọn.`}
        destructive
        confirmLabel="Xóa"
        loading={remove.isPending}
        onConfirm={() => void runBatchDelete()}
      />

      <ConfirmDialog
        open={soldTarget !== null}
        onOpenChange={(o) => !o && setSoldTarget(null)}
        title="Đánh dấu đã bán?"
        message="Sách sẽ được đặt số lượng = 0."
        confirmLabel="Xác nhận"
        loading={sold.isPending}
        onConfirm={() => {
          if (soldTarget === null) return;
          sold.mutate(soldTarget, {
            onSuccess: () => {
              toast.success("Đã cập nhật tồn kho");
              setSoldTarget(null);
            },
            onError: (e) => toast.error(errorMessage(e)),
          });
        }}
      />
    </div>
  );
}
