"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { UserAvatar, UserNameBlock } from "./user-identity";
import { formatJoined, lockBlockedReason } from "./user-meta";
import {
  UserLockAction,
  UserStatusCell,
  UserViewButton,
} from "./user-row-cells";
import type { UsersListProps } from "./users-table";

/** Mobile (< md) user list. */
export function UsersCardList({
  users,
  total,
  isLoading,
  selfId,
  savingId,
  onView,
  onLock,
  onUnlock,
}: UsersListProps & { total: number }) {
  if (isLoading) {
    return (
      <ul className="flex flex-col gap-space-sm">
        {Array.from({ length: 4 }, (_, i) => (
          <li key={i}>
            <Skeleton className="h-36 rounded-[1.25rem]" />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-space-sm">
      <span className="text-body-sm text-on-surface-variant">
        <span className="tabular-nums">{total}</span> tài khoản
      </span>
      <ul className="flex flex-col gap-space-sm">
        {users.map((u) => {
          const isSelf = u.id === selfId;
          const showAction = u.is_locked || !lockBlockedReason(u, isSelf);
          return (
            <li
              key={u.id}
              className={cn(
                "rounded-[1.25rem] bg-surface-container-lowest p-space-md shadow-pod",
                u.is_locked && "locked-hatch",
              )}
            >
              <div className="flex items-start gap-3">
                <UserAvatar user={u} size="lg" />
                <div className="min-w-0 flex-1">
                  <UserNameBlock user={u} isSelf={isSelf} />
                  <div className="mt-1 text-body-sm tabular-nums text-on-surface-variant">
                    {u.phone ?? "Chưa có số điện thoại"} · tham gia{" "}
                    {formatJoined(u.created_at).toLowerCase()}
                  </div>
                </div>
                <UserViewButton user={u} onView={onView} className="-mr-1 -mt-1 size-11" />
              </div>
              <div className="mt-space-sm flex items-center justify-between gap-space-sm border-t border-surface-container pt-space-sm">
                <UserStatusCell user={u} />
                {showAction && (
                  <div className="w-32 shrink-0">
                    <UserLockAction
                      user={u}
                      isSelf={isSelf}
                      saving={savingId === u.id}
                      block
                      onLock={onLock}
                      onUnlock={onUnlock}
                    />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
