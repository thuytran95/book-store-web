"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { components } from "@/lib/api/schema";
import { errorMessage } from "@/lib/error-messages";
import { formatDate, reservationStatusLabel } from "@/lib/format";
import { toast } from "@/lib/toast";
import { useAdminReservations, useCancelAdminReservation } from "../hooks/use-admin";

type Status = components["schemas"]["ReservationStatus"];
const TABS: (Status | "all")[] = ["all", "active", "expired", "converted", "cancelled"];

export function AdminReservationsPage() {
  const [status, setStatus] = useState<Status | undefined>("active");
  const [page, setPage] = useState(1);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const { data, isLoading, error } = useAdminReservations(status, page);
  const cancel = useCancelAdminReservation();
  const pageCount = data ? Math.max(1, Math.ceil(data.total / data.size)) : 1;

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">Giữ sách</h1>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Button
            key={t}
            size="sm"
            variant={(status ?? "all") === t ? "default" : "outline"}
            onClick={() => {
              setStatus(t === "all" ? undefined : t);
              setPage(1);
            }}
          >
            {t === "all" ? "Tất cả" : reservationStatusLabel(t)}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-48" />
      ) : error ? (
        <ErrorMessage error={error} />
      ) : !data?.items.length ? (
        <EmptyState title="Không có lượt giữ sách" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sách</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Hết hạn</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  {r.book_slug ? (
                    <Link href={`/books/${r.book_slug}`} className="hover:underline">
                      {r.book_title || `#${r.book_id}`}
                    </Link>
                  ) : (
                    `#${r.book_id}`
                  )}
                </TableCell>
                <TableCell>#{r.user_id}</TableCell>
                <TableCell>{reservationStatusLabel(r.status)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(r.expires_at)}</TableCell>
                <TableCell className="text-right">
                  {r.status === "active" && (
                    <Button size="xs" variant="destructive" onClick={() => setCancelId(r.id)}>
                      Huỷ giữ
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Pagination page={page} pageCount={pageCount} onChange={setPage} />

      <ConfirmDialog
        open={cancelId !== null}
        onOpenChange={(o) => !o && setCancelId(null)}
        title="Huỷ lượt giữ sách?"
        message="Sách sẽ được mở bán lại."
        destructive
        confirmLabel="Huỷ giữ"
        loading={cancel.isPending}
        onConfirm={() =>
          cancelId !== null &&
          cancel.mutate(cancelId, {
            onSuccess: () => {
              toast.success("Đã huỷ lượt giữ");
              setCancelId(null);
            },
            onError: (e) => toast.error(errorMessage(e)),
          })
        }
      />
    </div>
  );
}
