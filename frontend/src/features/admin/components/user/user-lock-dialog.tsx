"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MaterialIcon } from "@/features/home/components/material-icon";
import type { components } from "@/lib/api/schema";
import { UserAvatar, UserNameBlock } from "./user-identity";

type AdminUserRead = components["schemas"]["AdminUserRead"];

export function UserLockDialog({
  user,
  onOpenChange,
  onConfirm,
}: {
  /** null = closed. */
  user: AdminUserRead | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (u: AdminUserRead) => void;
}) {
  return (
    <Dialog open={user != null} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[min(92vw,440px)] gap-space-md rounded-[1.5rem] p-space-lg sm:max-w-[440px]"
      >
        {user && (
          <>
            <div className="flex items-center gap-space-sm">
              <UserAvatar user={user} size="lg" />
              <UserNameBlock user={user} isSelf={false} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-headline-md text-on-surface">
                Khóa tài khoản của {user.full_name}?
              </DialogTitle>
            </DialogHeader>
            <ul className="flex flex-col gap-space-xs text-body-md text-on-surface-variant">
              <li className="flex gap-space-sm">
                <MaterialIcon name="logout" className="mt-0.5 text-[18px] text-outline" />
                <span>
                  Người này bị đăng xuất và không đăng nhập lại được cho tới khi bạn mở khóa.
                </span>
              </li>
              <li className="flex gap-space-sm">
                <MaterialIcon name="receipt_long" className="mt-0.5 text-[18px] text-outline" />
                <span>
                  {user.active_order_count > 0 ? (
                    <>
                      <b className="tabular-nums text-on-surface">{user.active_order_count}</b> đơn
                      đang xử lý vẫn giữ nguyên. Bạn tự quyết định tiếp tục giao hay hủy ở trang
                      Đơn hàng.
                    </>
                  ) : (
                    "Các đơn cũ vẫn được giữ trong lịch sử."
                  )}
                </span>
              </li>
            </ul>
            <DialogFooter className="gap-space-sm pt-space-xs">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                className="rounded-full"
              >
                Để sau
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  onConfirm(user);
                  onOpenChange(false);
                }}
                className="rounded-full"
              >
                Khóa tài khoản
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
