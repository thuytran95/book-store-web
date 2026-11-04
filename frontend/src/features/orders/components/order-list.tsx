"use client";

import Link from "next/link";
import { useState } from "react";
import { OrderStatusBadge, PriceTag } from "@/components/shared/badges";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatDate, paymentLabel } from "@/lib/format";
import { useOrders } from "../hooks/use-orders";

export function OrderList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useOrders(page);
  const pageCount = data ? Math.max(1, Math.ceil(data.total / data.size)) : 1;

  if (isLoading) return <Skeleton className="h-48" />;
  if (error) return <ErrorMessage error={error} />;
  if (!data?.items.length) {
    return (
      <EmptyState
        title="Bạn chưa có đơn hàng nào"
        description="Khi đặt hàng, đơn sẽ hiện ở đây."
        action={<Button render={<Link href="/books" />}>Xem sách</Button>}
      />
    );
  }

  return (
    <div className="grid gap-3">
      <ul className="grid gap-3">
        {data.items.map((o) => (
          <li key={o.id}>
            <Link
              href={`/orders/${o.id}`}
              className="grid gap-1 rounded-xl border p-4 hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{o.code}</span>
                <OrderStatusBadge status={o.status} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                <span>
                  {formatDate(o.created_at)} · {paymentLabel(o.payment_method)}
                </span>
                <PriceTag amount={o.total} size="sm" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <Pagination page={page} pageCount={pageCount} onChange={setPage} />
    </div>
  );
}
