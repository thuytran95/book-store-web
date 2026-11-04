"use client";

import Link from "next/link";
import { useState } from "react";
import { OrderStatusBadge, PriceTag } from "@/components/shared/badges";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { components } from "@/lib/api/schema";
import { formatDate, orderStatusLabel, paymentLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAdminOrders } from "../hooks/use-admin";

type OrderStatus = components["schemas"]["OrderStatus"];
const TABS: (OrderStatus | "all")[] = ["all", "pending", "confirmed", "shipping", "completed", "cancelled"];

export function OrdersTable() {
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
  const [code, setCode] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAdminOrders(status, page, code.trim() || undefined);
  const pageCount = data ? Math.max(1, Math.ceil(data.total / data.size)) : 1;

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">Đơn hàng</h1>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Button
            key={t}
            size="sm"
            variant={(status ?? "all") === t ? "default" : "outline"}
            className={cn("capitalize")}
            onClick={() => {
              setStatus(t === "all" ? undefined : t);
              setPage(1);
            }}
          >
            {t === "all" ? "Tất cả" : orderStatusLabel(t)}
          </Button>
        ))}
        <Input
          className="ml-auto max-w-48"
          placeholder="Mã đơn"
          aria-label="Tìm mã đơn"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : error ? (
        <ErrorMessage error={error} />
      ) : !data?.items.length ? (
        <EmptyState title="Không có đơn hàng" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thanh toán</TableHead>
              <TableHead>Tổng</TableHead>
              <TableHead>Ngày</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                    {o.code}
                  </Link>
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={o.status} />
                </TableCell>
                <TableCell>{paymentLabel(o.payment_method)}</TableCell>
                <TableCell>
                  <PriceTag amount={o.total} size="sm" />
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(o.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Pagination page={page} pageCount={pageCount} onChange={setPage} />
    </div>
  );
}
