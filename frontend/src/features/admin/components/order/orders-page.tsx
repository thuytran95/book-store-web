"use client";

import { useEffect, useState } from "react";
import { TablePagination } from "@/components/shared/table-pagination";
import { MaterialIcon } from "@/features/home/components/material-icon";
import type { components } from "@/lib/api/schema";
import { getPageInfo } from "@/lib/pagination";
import { toast } from "@/lib/toast";
import {
  useAdminOrder,
  useAdminOrderCounts,
  useAdminOrders,
  useTransitionOrder,
} from "../../hooks/use-admin";
import { useAdminOrderFilters } from "../../hooks/use-admin-order-filters";
import { OrderCancelDialog } from "./order-cancel-dialog";
import { OrderDetailDrawer } from "./order-detail-drawer";
import { NEXT_STEP } from "./order-meta";
import { OrdersCardList } from "./orders-card-list";
import { OrdersHeader } from "./orders-header";
import { OrdersStatusPipeline } from "./orders-status-pipeline";
import { OrdersTable } from "./orders-table";
import { OrdersToolbar } from "./orders-toolbar";

type OrderStatus = components["schemas"]["OrderStatus"];
type CancelTarget = { id: number; code: string; status: OrderStatus; copies: number };

const TAB_EMPTY: Record<OrderStatus, { icon: string; title: string; body?: string }> = {
  pending: {
    icon: "task_alt",
    title: "Không còn đơn nào chờ xác nhận",
    body: "Đơn mới của người mua sẽ xuất hiện ở đây.",
  },
  confirmed: { icon: "inventory", title: "Không có đơn chờ đóng gói" },
  shipping: { icon: "local_shipping", title: "Không có đơn đang giao" },
  completed: { icon: "task_alt", title: "Chưa có đơn hoàn thành" },
  cancelled: { icon: "block", title: "Chưa có đơn bị hủy" },
};

export function OrdersPage() {
  const { filters, openId, setFilter, setFilters, openOrder, closeOrder } = useAdminOrderFilters();
  const q = filters.q ?? "";
  const [searchInput, setSearchInput] = useState(q);
  const [cancelTarget, setCancelTarget] = useState<CancelTarget | null>(null);

  // Keep the input in sync when `q` changes from outside (chip ×, "Xóa từ khóa", back button).
  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  // 300 ms debounce from the input into `q`.
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (searchInput.trim() !== q) setFilter("q", searchInput.trim());
    }, 300);
    return () => window.clearTimeout(t);
  }, [searchInput, q, setFilter]);

  const list = useAdminOrders(filters);
  const counts = useAdminOrderCounts();
  const detail = useAdminOrder(openId); // shared with the drawer (same query key)
  const transition = useTransitionOrder();
  const savingId = transition.pendingId ?? null;

  const orders = list.data?.items ?? [];
  const total = list.data?.total ?? 0;
  const page = filters.page ?? 1;

  const advance = (id: number, to: OrderStatus) => {
    transition.mutate(
      { id, to },
      {
        onSuccess: (o) => {
          const step = Object.values(NEXT_STEP).find((s) => s.to === to);
          const copies = o.items.reduce((n, i) => n + i.quantity, 0);
          if (step) toast.success(step.done(o.code, copies));
        },
      },
    );
  };

  const askCancel = (id: number) => {
    const row = orders.find((o) => o.id === id);
    if (row) {
      setCancelTarget({ id, code: row.code, status: row.status, copies: row.copies });
      return;
    }
    const d = detail.data?.id === id ? detail.data : undefined;
    if (d) {
      const copies = d.items.reduce((n, i) => n + i.quantity, 0);
      setCancelTarget({ id, code: d.code, status: d.status, copies });
    }
  };

  const confirmCancel = (reason: string | undefined) => {
    const target = cancelTarget;
    if (!target) return;
    transition.mutate(
      { id: target.id, to: "cancelled", reason },
      {
        onSuccess: () => {
          const back = target.status === "pending" ? 0 : target.copies;
          toast.success(`Đã hủy đơn ${target.code}` + (back ? `, hoàn ${back} bản vào kho` : ""));
          setCancelTarget(null);
        },
      },
    );
  };

  const setPage = (p: number) => {
    setFilter("page", p);
    window.scrollTo({ top: 0 });
  };

  const loading = list.isLoading;
  const empty = !loading && !list.error && orders.length === 0;

  let emptyBlock: React.ReactNode = null;
  if (empty) {
    if (counts.data?.all === 0) {
      emptyBlock = (
        <ListMessage
          icon="package_2"
          title="Chưa có đơn hàng nào"
          body="Khi người mua đặt sách, đơn sẽ hiện ở đây để bạn xác nhận và theo dõi giao hàng."
        />
      );
    } else if (q) {
      emptyBlock = (
        <ListMessage
          icon="search_off"
          title="Không tìm thấy đơn phù hợp"
          body="Kiểm tra lại mã đơn hoặc số điện thoại, hoặc tìm ở mọi trạng thái."
          action={<TonalButton onClick={() => setFilter("q", "")}>Xóa từ khóa</TonalButton>}
        />
      );
    } else if (filters.status) {
      emptyBlock = <ListMessage {...TAB_EMPTY[filters.status]} />;
    } else {
      emptyBlock = <ListMessage icon="package_2" title="Không có đơn hàng" />;
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col gap-space-lg px-space-md py-space-lg md:px-space-xl">
      <OrdersHeader
        counts={counts.data}
        isLoading={counts.isLoading}
        onShowStale={() => setFilters({ status: "pending", sort: "oldest" })}
      />

      <OrdersStatusPipeline
        counts={counts.data}
        isLoading={counts.isLoading}
        status={filters.status ?? ""}
        onStatusChange={(s) => setFilter("status", s)}
      />

      <OrdersToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        sort={filters.sort ?? "newest"}
        onSortChange={(s) => setFilter("sort", s)}
        q={q}
        onClearQuery={() => setFilter("q", "")}
      />

      <section aria-label="Danh sách đơn hàng" className="flex flex-col gap-space-md">
        {list.error ? (
          <ListMessage
            icon="cloud_off"
            title="Không tải được danh sách đơn"
            body="Kiểm tra kết nối tới máy chủ rồi thử lại."
            action={
              <button
                type="button"
                onClick={() => void list.refetch()}
                className="min-h-10 rounded-full bg-primary px-space-lg text-label-lg font-semibold text-on-primary"
              >
                Thử lại
              </button>
            }
          />
        ) : empty ? (
          emptyBlock
        ) : (
          <>
            <div className="hidden md:block">
              <OrdersTable
                orders={orders}
                isLoading={loading}
                savingId={savingId}
                onOpen={openOrder}
                onAdvance={advance}
                onCancel={askCancel}
              />
            </div>
            <div className="md:hidden">
              <OrdersCardList
                orders={orders}
                total={total}
                isLoading={loading}
                savingId={savingId}
                onOpen={openOrder}
                onAdvance={advance}
                onCancel={askCancel}
              />
            </div>
          </>
        )}

        {!loading && !list.error && total > 0 && (
          <TablePagination
            {...getPageInfo(page, filters.size ?? 20, total)}
            setPage={setPage}
            itemLabel="đơn"
          />
        )}
      </section>

      <OrderDetailDrawer
        orderId={openId ?? null}
        onClose={closeOrder}
        onAdvance={advance}
        onCancel={askCancel}
        savingId={savingId}
      />

      <OrderCancelDialog
        order={cancelTarget}
        pending={transition.isPending && transition.variables?.to === "cancelled"}
        onConfirm={confirmCancel}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
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
    <div className="flex flex-col items-center gap-space-sm rounded-lg bg-surface-container-lowest px-space-lg py-12 text-center shadow-pod">
      <span className="grid size-14 place-items-center rounded-full bg-surface-container-low text-primary">
        <MaterialIcon name={icon} className="text-[28px]" />
      </span>
      <h2 className="text-headline-sm text-on-surface">{title}</h2>
      {body && <p className="max-w-sm text-body-md text-on-surface-variant">{body}</p>}
      {action && <div className="mt-space-xs">{action}</div>}
    </div>
  );
}

function TonalButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-10 rounded-full bg-surface-container-low px-space-lg text-label-lg font-semibold text-primary hover:bg-surface-container"
    >
      {children}
    </button>
  );
}
