"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PriceTag } from "@/components/shared/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { components } from "@/lib/api/schema";
import { formatVnd, orderStatusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useBestSellers, useLowStock, useRevenue, useSummary } from "../hooks/use-admin";

type Granularity = components["schemas"]["Granularity"];

export function Dashboard() {
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const range = useMemo(() => ({ from: from || undefined, to: to || undefined }), [from, to]);

  const revenue = useRevenue(granularity, range);
  const summary = useSummary();
  const best = useBestSellers(10);
  const low = useLowStock(2);

  const chart = (revenue.data ?? []).map((p) => ({
    ...p,
    label: p.period.slice(0, granularity === "month" ? 7 : 10),
  }));

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Tổng quan</h1>
          <p className="text-sm text-muted-foreground">Doanh thu chỉ tính đơn đã hoàn thành.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex rounded-lg border p-0.5">
            {(["day", "month"] as const).map((g) => (
              <Button
                key={g}
                size="sm"
                variant={granularity === g ? "default" : "ghost"}
                onClick={() => setGranularity(g)}
              >
                {g === "day" ? "Theo ngày" : "Theo tháng"}
              </Button>
            ))}
          </div>
          <Input type="date" aria-label="Từ ngày" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" aria-label="Đến ngày" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </header>

      {summary.isLoading ? (
        <Skeleton className="h-24" />
      ) : summary.error ? (
        <ErrorMessage error={summary.error} />
      ) : summary.data ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle>Doanh thu hoàn thành</CardTitle>
            </CardHeader>
            <CardContent>
              <PriceTag amount={summary.data.completed_revenue} size="lg" />
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>Tổng đơn</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{summary.data.total_orders}</CardContent>
          </Card>
          {summary.data.counts.map((c) => (
            <Card key={c.status} size="sm">
              <CardHeader>
                <CardTitle>{orderStatusLabel(c.status as components["schemas"]["OrderStatus"])}</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{c.count}</CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Doanh thu</CardTitle>
        </CardHeader>
        <CardContent>
          {revenue.isLoading ? (
            <Skeleton className="h-64" />
          ) : revenue.error ? (
            <ErrorMessage error={revenue.error} />
          ) : chart.length === 0 ? (
            <EmptyState title="Chưa có dữ liệu doanh thu" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
                  <Tooltip formatter={(v) => formatVnd(Number(v))} />
                  <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="var(--color-primary)" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bán chạy</CardTitle>
          </CardHeader>
          <CardContent>
            {best.isLoading ? (
              <Skeleton className="h-32" />
            ) : best.error ? (
              <ErrorMessage error={best.error} />
            ) : !best.data?.length ? (
              <EmptyState title="Chưa có sách bán chạy" />
            ) : (
              <ul className="grid gap-2 text-sm">
                {best.data.map((b) => (
                  <li key={b.book_id} className="flex justify-between gap-3">
                    <Link href={`/admin/books/${b.book_id}`} className="hover:underline">
                      {b.title}
                    </Link>
                    <span className="text-muted-foreground tabular-nums">
                      {b.quantity_sold} · {formatVnd(b.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sắp hết hàng</CardTitle>
          </CardHeader>
          <CardContent>
            {low.isLoading ? (
              <Skeleton className="h-32" />
            ) : low.error ? (
              <ErrorMessage error={low.error} />
            ) : !low.data?.length ? (
              <EmptyState title="Không có sách sắp hết" />
            ) : (
              <ul className="grid gap-2 text-sm">
                {low.data.map((b) => (
                  <li key={b.book_id} className="flex justify-between gap-3">
                    <Link href={`/admin/books/${b.book_id}`} className={cn("hover:underline", !b.is_visible && "text-muted-foreground")}>
                      {b.title}
                    </Link>
                    <span className="tabular-nums">còn {b.quantity}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
