"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { hasCode } from "@/lib/api/errors";
import { errorMessage } from "@/lib/error-messages";
import { formatDate } from "@/lib/format";
import { useSession } from "@/lib/session";
import { toast } from "@/lib/toast";
import { useAdminUsers, useSetUserLocked } from "../hooks/use-admin";

type Row = { id: number; full_name: string; is_locked: boolean };

export function UsersPage() {
  const { session } = useSession();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<Row | null>(null);
  const { data, isLoading, error } = useAdminUsers(search, page);
  const lock = useSetUserLocked();
  const pageCount = data ? Math.max(1, Math.ceil(data.total / data.size)) : 1;

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">Người dùng</h1>
      <Input
        type="search"
        className="max-w-xs"
        placeholder="Tên hoặc email"
        aria-label="Tìm người dùng"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      {isLoading ? (
        <Skeleton className="h-48" />
      ) : error ? (
        <ErrorMessage error={error} />
      ) : !data?.items.length ? (
        <EmptyState title="Không tìm thấy người dùng" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((u) => {
              const self = session?.user.id === u.id;
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role === "admin" ? "Quản trị" : "Khách"}</TableCell>
                  <TableCell>
                    {u.is_locked ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">Đã khoá</span>
                    ) : (
                      <span className="text-muted-foreground">Hoạt động</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(u.created_at, false)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="xs"
                      variant={u.is_locked ? "outline" : "destructive"}
                      disabled={self}
                      title={self ? "Không thể khoá chính mình" : undefined}
                      onClick={() => setTarget(u)}
                    >
                      {u.is_locked ? "Mở khoá" : "Khoá"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
      <Pagination page={page} pageCount={pageCount} onChange={setPage} />

      <ConfirmDialog
        open={target !== null}
        onOpenChange={(o) => !o && setTarget(null)}
        title={target?.is_locked ? `Mở khoá ${target.full_name}?` : `Khoá ${target?.full_name}?`}
        message={
          target?.is_locked
            ? "Tài khoản sẽ đăng nhập được trở lại."
            : "Người dùng sẽ không đăng nhập được cho đến khi được mở khoá."
        }
        destructive={!target?.is_locked}
        confirmLabel={target?.is_locked ? "Mở khoá" : "Khoá"}
        loading={lock.isPending}
        onConfirm={() => {
          if (!target) return;
          lock.mutate(
            { id: target.id, locked: !target.is_locked },
            {
              onSuccess: () => {
                toast.success(target.is_locked ? "Đã mở khoá" : "Đã khoá tài khoản");
                setTarget(null);
              },
              onError: (e) => {
                toast.error(hasCode(e, "CANNOT_LOCK_SELF") ? "Bạn không thể khoá chính mình." : errorMessage(e));
                setTarget(null);
              },
            },
          );
        }}
      />
    </div>
  );
}
