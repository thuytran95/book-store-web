"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { components } from "@/lib/api/schema";
import { formatVnd, paymentShortLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { OrderNextStepButton, OrderRowMenu } from "./order-row-actions";
import { OrderStatusChip } from "./order-status-chip";

type AdminOrderSummary = components["schemas"]["AdminOrderSummary"];
type OrderStatus = components["schemas"]["OrderStatus"];

const HEAD = "h-12 px-4 text-[14px] font-semibold text-on-primary";
const CELL = "px-4 py-3 align-middle";

/** Desktop (≥ md) order list. Error and empty blocks are rendered by the page. */
export function OrdersTable({
  orders,
  isLoading,
  savingId,
  onOpen,
  onAdvance,
  onCancel,
}: {
  orders: AdminOrderSummary[];
  isLoading: boolean;
  savingId: number | null;
  onOpen: (id: number) => void;
  onAdvance: (id: number, to: OrderStatus) => void;
  onCancel: (id: number) => void;
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] bg-surface-container-lowest shadow-pod">
      <Table>
        <TableHeader className="bg-primary">
          <TableRow className="border-0 hover:bg-primary">
            <TableHead className={cn(HEAD, "pl-space-lg")}>Mã đơn</TableHead>
            <TableHead className={HEAD}>Người nhận</TableHead>
            <TableHead className={cn(HEAD, "text-right")}>Tổng tiền</TableHead>
            <TableHead className={HEAD}>Thanh toán</TableHead>
            <TableHead className={HEAD}>Trạng thái</TableHead>
            <TableHead className={cn(HEAD, "text-right")}>Bước tiếp theo</TableHead>
            <TableHead className={cn(HEAD, "w-12")}>
              <span className="sr-only">Thao tác</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 8 }, (_, i) => <SkeletonRow key={i} />)
            : orders.map((o) => {
                const dim = o.status === "cancelled" ? "opacity-60" : undefined;
                return (
                  <TableRow
                    key={o.id}
                    className="border-t border-surface-container hover:bg-surface-container-low"
                  >
                    <TableCell className={cn(CELL, "pl-space-lg")}>
                      <button
                        type="button"
                        onClick={() => onOpen(o.id)}
                        className="text-label-lg font-semibold tabular-nums text-on-surface hover:text-primary hover:underline"
                      >
                        {o.code}
                      </button>
                    </TableCell>
                    <TableCell className={cn(CELL, "whitespace-nowrap text-label-lg", dim)}>
                      {o.ship_recipient}
                    </TableCell>
                    <TableCell
                      className={cn(
                        CELL,
                        "whitespace-nowrap text-right text-label-lg font-semibold tabular-nums text-tertiary",
                        dim,
                      )}
                    >
                      {formatVnd(o.total)}
                    </TableCell>
                    <TableCell
                      className={cn(CELL, "whitespace-nowrap text-body-md text-on-surface-variant", dim)}
                    >
                      {paymentShortLabel(o.payment_method)}
                    </TableCell>
                    <TableCell className={CELL}>
                      <OrderStatusChip status={o.status} />
                    </TableCell>
                    <TableCell className={cn(CELL, "text-right")}>
                      <OrderNextStepButton
                        order={o}
                        saving={savingId === o.id}
                        blocked={o.has_shortage}
                        onAdvance={onAdvance}
                      />
                    </TableCell>
                    <TableCell className={cn(CELL, "pl-0 pr-space-sm")}>
                      <OrderRowMenu order={o} onOpen={onOpen} onCancel={onCancel} />
                    </TableCell>
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>
    </div>
  );
}

function SkeletonRow() {
  return (
    <TableRow className="border-t border-surface-container hover:bg-transparent">
      <TableCell className={cn(CELL, "py-4 pl-space-lg")}>
        <Skeleton className="h-3 w-32 rounded-full" />
      </TableCell>
      <TableCell className={cn(CELL, "py-4")}>
        <Skeleton className="h-3 w-28 rounded-full" />
      </TableCell>
      <TableCell className={cn(CELL, "py-4")}>
        <Skeleton className="ml-auto h-3 w-20 rounded-full" />
      </TableCell>
      <TableCell className={cn(CELL, "py-4")}>
        <Skeleton className="h-3 w-20 rounded-full" />
      </TableCell>
      <TableCell className={cn(CELL, "py-4")}>
        <Skeleton className="h-6 w-24 rounded-full" />
      </TableCell>
      <TableCell className={cn(CELL, "py-4")}>
        <Skeleton className="ml-auto h-9 w-28 rounded-full" />
      </TableCell>
      <TableCell className={CELL} />
    </TableRow>
  );
}
