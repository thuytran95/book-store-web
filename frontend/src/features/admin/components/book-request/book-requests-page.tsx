"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormField } from "@/components/ui/form-field";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { components } from "@/lib/api/schema";
import { hasCode } from "@/lib/api/errors";
import { errorMessage } from "@/lib/error-messages";
import { formatDate, requestStatusLabel } from "@/lib/format";
import { toast } from "@/lib/toast";
import { useAdminBookRequests, useResolveBookRequest } from "../../hooks/use-admin";

type Status = components["schemas"]["BookRequestStatus"];
type Row = components["schemas"]["BookRequestRead"];
const TABS: (Status | "all")[] = ["all", "pending", "available", "rejected"];

export function AdminBookRequestsPage() {
  const [status, setStatus] = useState<Status | undefined>("pending");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<{ row: Row; to: "available" | "rejected" } | null>(null);
  const [note, setNote] = useState("");
  const { data, isLoading, error } = useAdminBookRequests(status, page);
  const resolve = useResolveBookRequest();
  const pageCount = data ? Math.max(1, Math.ceil(data.total / data.size)) : 1;

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">Yêu cầu tìm sách</h1>
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
            {t === "all" ? "Tất cả" : requestStatusLabel(t)}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-48" />
      ) : error ? (
        <ErrorMessage error={error} />
      ) : !data?.items.length ? (
        <EmptyState title="Không có yêu cầu" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sách</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <p className="font-medium">{r.title}</p>
                  {r.author && <p className="text-xs text-muted-foreground">{r.author}</p>}
                  {r.note && <p className="text-xs">{r.note}</p>}
                  {r.admin_note && <p className="text-xs text-muted-foreground">Phản hồi: {r.admin_note}</p>}
                </TableCell>
                <TableCell>#{r.user_id}</TableCell>
                <TableCell>{requestStatusLabel(r.status)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(r.created_at)}</TableCell>
                <TableCell className="text-right">
                  {r.status === "pending" && (
                    <div className="flex justify-end gap-1">
                      <Button size="xs" onClick={() => { setTarget({ row: r, to: "available" }); setNote(""); }}>
                        Có sách
                      </Button>
                      <Button size="xs" variant="destructive" onClick={() => { setTarget({ row: r, to: "rejected" }); setNote(""); }}>
                        Từ chối
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Pagination page={page} pageCount={pageCount} onChange={setPage} />

      <Dialog open={target !== null} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {target?.to === "available" ? "Đánh dấu đã có sách?" : "Từ chối yêu cầu?"}
            </DialogTitle>
          </DialogHeader>
          {hasCode(resolve.error, "ALREADY_RESOLVED") && (
            <p role="alert" className="text-sm text-destructive">Yêu cầu này đã được xử lý.</p>
          )}
          <FormField label="Ghi chú cho khách">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </FormField>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)}>Đóng</Button>
            <Button
              variant={target?.to === "rejected" ? "destructive" : "default"}
              disabled={resolve.isPending}
              onClick={() => {
                if (!target) return;
                resolve.mutate(
                  { id: target.row.id, status: target.to, adminNote: note || undefined },
                  {
                    onSuccess: () => {
                      toast.success("Đã cập nhật yêu cầu");
                      setTarget(null);
                    },
                    onError: (e) => toast.error(errorMessage(e)),
                  },
                );
              }}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
