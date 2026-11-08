"use client";

import { useState } from "react";
import { TablePagination } from "@/components/shared/table-pagination";
import { MaterialIcon } from "@/features/home/components/material-icon";
import type { components } from "@/lib/api/schema";
import { getPageInfo } from "@/lib/pagination";
import { useSession } from "@/lib/session";
import { toast } from "@/lib/toast";
import { useAdminUserCounts, useAdminUsers, useSetUserLocked } from "../../hooks/use-admin";
import { useAdminUserFilters } from "../../hooks/use-admin-user-filters";
import { UserDetailDialog } from "./user-detail-dialog";
import { UserLockDialog } from "./user-lock-dialog";
import { UsersCardList } from "./users-card-list";
import { UsersHeader } from "./users-header";
import { UsersTable } from "./users-table";
import { UsersToolbar } from "./users-toolbar";

type AdminUserRead = components["schemas"]["AdminUserRead"];

export function UsersPage() {
  const { filters, setFilter } = useAdminUserFilters();
  const { session } = useSession();
  const selfId = session?.user.id;

  const list = useAdminUsers(filters);
  const counts = useAdminUserCounts();
  const lock = useSetUserLocked();
  const savingId = lock.savingId ?? null;
  const [lockTarget, setLockTarget] = useState<AdminUserRead | null>(null);
  const [viewTarget, setViewTarget] = useState<AdminUserRead | null>(null);

  const users = list.data?.items ?? [];
  const total = list.data?.total ?? 0;
  // Prefer the fresh row from the list so the dialog reflects lock/unlock right away.
  const viewUser = viewTarget ? (users.find((u) => u.id === viewTarget.id) ?? viewTarget) : null;

  const unlock = (u: AdminUserRead) =>
    lock.mutate(
      { id: u.id, locked: false },
      { onSuccess: () => toast.success(`Đã mở khóa tài khoản ${u.full_name}`) },
    );

  const confirmLock = (u: AdminUserRead) =>
    lock.mutate(
      { id: u.id, locked: true },
      {
        onSuccess: () =>
          toast.success(`Đã khóa tài khoản ${u.full_name}`, {
            duration: 5000,
            action: { label: "Hoàn tác", onClick: () => unlock(u) },
          }),
      },
    );

  const setPage = (p: number) => {
    setFilter("page", p);
    window.scrollTo({ top: 0 });
  };

  const loading = list.isLoading;
  const empty = !loading && !list.error && users.length === 0;

  let emptyBlock: React.ReactNode = null;
  if (empty) {
    if (filters.q) {
      emptyBlock = (
        <ListMessage
          icon="person_search"
          title="Không tìm thấy người dùng phù hợp"
          body="Thử tìm bằng email hoặc số điện thoại đầy đủ."
          action={
            <button
              type="button"
              onClick={() => setFilter("q", "")}
              className="min-h-10 rounded-full bg-surface-container-low px-space-lg text-label-lg font-semibold text-primary hover:bg-surface-container"
            >
              Xóa từ khóa
            </button>
          }
        />
      );
    } else if (filters.status === "locked") {
      emptyBlock = <ListMessage icon="lock_open" title="Không có tài khoản nào bị khóa" />;
    } else {
      emptyBlock = (
        <ListMessage
          icon="group"
          title="Chưa có người mua nào"
          body="Người mua đăng ký tài khoản trên shop sẽ hiện ở đây."
        />
      );
    }
  }

  const listProps = {
    users,
    isLoading: loading,
    selfId,
    savingId,
    onView: setViewTarget,
    onLock: setLockTarget,
    onUnlock: unlock,
  };

  return (
    <div className="mx-auto flex w-full flex-col gap-space-lg px-space-md py-space-lg md:px-space-xl">
      <UsersHeader counts={counts.data} isLoading={counts.isLoading} />

      <UsersToolbar
        status={filters.status}
        onStatusChange={(s) => setFilter("status", s)}
        counts={counts.data}
        isLoading={counts.isLoading}
        q={filters.q}
        onSearch={(q) => setFilter("q", q)}
      />

      <section aria-label="Danh sách người dùng" className="flex flex-col gap-space-md">
        {list.error ? (
          <ListMessage
            icon="cloud_off"
            title="Không tải được danh sách người dùng"
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
              <UsersTable {...listProps} />
            </div>
            <div className="md:hidden">
              <UsersCardList {...listProps} total={total} />
            </div>
          </>
        )}

        {!loading && !list.error && total > 0 && (
          <TablePagination
            {...getPageInfo(filters.page, filters.size, total)}
            setPage={setPage}
            itemLabel="tài khoản"
          />
        )}
      </section>

      <UserDetailDialog
        user={viewUser}
        isSelf={viewUser?.id === selfId}
        saving={viewUser != null && savingId === viewUser.id}
        onOpenChange={(open) => {
          if (!open) setViewTarget(null);
        }}
        onLock={(u) => {
          setViewTarget(null);
          setLockTarget(u);
        }}
        onUnlock={unlock}
      />

      <UserLockDialog
        user={lockTarget}
        onOpenChange={(open) => {
          if (!open) setLockTarget(null);
        }}
        onConfirm={confirmLock}
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
