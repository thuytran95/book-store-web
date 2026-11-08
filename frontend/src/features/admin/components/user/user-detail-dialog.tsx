"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MaterialIcon } from "@/features/home/components/material-icon";
import type { components } from "@/lib/api/schema";
import { formatDate } from "@/lib/format";
import { UserAvatar, UserRoleText } from "./user-identity";
import { formatJoined } from "./user-meta";
import { UserLockAction, UserStatusCell } from "./user-row-cells";

type AdminUserRead = components["schemas"]["AdminUserRead"];

/** Read-only account info (from the list row; no extra request) + lock/unlock + link to orders. */
export function UserDetailDialog({
  user,
  isSelf,
  saving,
  onOpenChange,
  onLock,
  onUnlock,
}: {
  /** null = closed. */
  user: AdminUserRead | null;
  isSelf: boolean;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onLock: (u: AdminUserRead) => void;
  onUnlock: (u: AdminUserRead) => void;
}) {
  return (
    <Dialog open={user != null} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(92vw,480px)] gap-space-md rounded-[1.5rem] p-space-lg sm:max-w-[480px]">
        {user && (
          <>
            <DialogHeader className="flex-row items-center gap-space-sm text-left">
              <UserAvatar user={user} size="lg" />
              <div className="min-w-0">
                <DialogTitle className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-headline-sm text-on-surface">
                  {user.full_name}
                  {isSelf && (
                    <span className="rounded-full bg-surface-container px-2 py-0.5 text-label-sm font-normal text-on-surface-variant">
                      Bạn
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription className="truncate text-body-sm text-on-surface-variant">
                  {user.email}
                </DialogDescription>
              </div>
            </DialogHeader>

            <dl className="grid grid-cols-[auto_1fr] gap-x-space-md gap-y-space-sm rounded-[1.25rem] bg-surface-container-low p-space-md text-body-md">
              <Row icon="badge" label="Vai trò">
                <UserRoleText role={user.role} />
              </Row>
              <Row icon="call" label="Số điện thoại">
                {user.phone ? (
                  <a href={`tel:${user.phone}`} className="tabular-nums hover:text-primary hover:underline">
                    {user.phone}
                  </a>
                ) : (
                  <span className="text-on-surface-variant">Chưa cập nhật</span>
                )}
              </Row>
              <Row icon="calendar_today" label="Tham gia">
                <span className="tabular-nums">
                  {formatDate(user.created_at, false)}
                  <span className="text-on-surface-variant"> · {formatJoined(user.created_at).toLowerCase()}</span>
                </span>
              </Row>
              <Row icon="verified_user" label="Trạng thái">
                <UserStatusCell user={user} />
              </Row>
              {user.role !== "admin" && (
                <Row icon="receipt_long" label="Đơn hàng">
                  {user.order_count > 0 ? (
                    <span className="flex flex-wrap items-center gap-x-space-sm">
                      <span className="tabular-nums">
                        {user.order_count} đơn
                        {user.active_order_count > 0 && (
                          <span className="font-medium text-tertiary-container">
                            {" "}
                            · {user.active_order_count} đang xử lý
                          </span>
                        )}
                      </span>
                      <Link
                        href={`/admin/orders?user=${user.id}`}
                        className="inline-flex items-center gap-0.5 text-label-md text-primary hover:underline"
                      >
                        Xem đơn hàng
                        <MaterialIcon name="arrow_forward" className="text-[16px]" />
                      </Link>
                    </span>
                  ) : (
                    <span className="text-on-surface-variant">Chưa đặt đơn</span>
                  )}
                </Row>
              )}
            </dl>

            <DialogFooter className="items-center gap-space-sm">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                className="rounded-full"
              >
                Đóng
              </Button>
              <UserLockAction
                user={user}
                isSelf={isSelf}
                saving={saving}
                onLock={onLock}
                onUnlock={onUnlock}
              />
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="flex items-center gap-space-xs whitespace-nowrap text-on-surface-variant">
        <MaterialIcon name={icon} className="text-[18px] text-outline" />
        {label}
      </dt>
      <dd className="min-w-0 self-center text-on-surface">{children}</dd>
    </>
  );
}
