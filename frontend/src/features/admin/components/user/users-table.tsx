"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { components } from "@/lib/api/schema";
import { cn } from "@/lib/utils";
import { UserAvatar, UserNameBlock, UserRoleText } from "./user-identity";
import { formatJoined } from "./user-meta";
import {
  UserLockAction,
  UserStatusCell,
  UserViewButton,
} from "./user-row-cells";

type AdminUserRead = components["schemas"]["AdminUserRead"];

const HEAD = "h-12 px-4 text-[14px] font-semibold text-on-primary whitespace-nowrap";
const CELL = "px-4 py-3 align-middle";

export type UsersListProps = {
  users: AdminUserRead[];
  isLoading: boolean;
  selfId: number | undefined;
  savingId: number | null;
  onView: (u: AdminUserRead) => void;
  onLock: (u: AdminUserRead) => void;
  onUnlock: (u: AdminUserRead) => void;
};

/** Desktop (≥ md) user list. Error and empty blocks are rendered by the page. */
export function UsersTable({
  users,
  isLoading,
  selfId,
  savingId,
  onView,
  onLock,
  onUnlock,
}: UsersListProps) {
  return (
    <div className="overflow-hidden rounded-[2rem] bg-surface-container-lowest shadow-pod">
      <Table>
        <TableHeader className="bg-primary">
          <TableRow className="border-0 hover:bg-primary">
            <TableHead className={cn(HEAD, "w-px pl-space-lg")}>Ảnh đại diện</TableHead>
            <TableHead className={HEAD}>Tên người dùng</TableHead>
            <TableHead className={HEAD}>Vai trò</TableHead>
            <TableHead className={HEAD}>Email</TableHead>
            <TableHead className={cn(HEAD, "hidden xl:table-cell")}>Tham gia</TableHead>
            <TableHead className={HEAD}>Trạng thái</TableHead>
            <TableHead className={cn(HEAD, "pr-space-lg text-right")}>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 8 }, (_, i) => <SkeletonRow key={i} />)
            : users.map((u) => {
                const isSelf = u.id === selfId;
                return (
                  <TableRow
                    key={u.id}
                    className={cn(
                      "border-t border-surface-container transition-colors",
                      u.is_locked
                        ? "locked-hatch hover:bg-transparent"
                        : "hover:bg-surface-container-low",
                    )}
                  >
                    <TableCell className={cn(CELL, "pl-space-lg")}>
                      <UserAvatar user={u} />
                    </TableCell>
                    <TableCell className={cn(CELL, "max-w-[18rem]")}>
                      <UserNameBlock user={u} isSelf={isSelf} showRole={false} showEmail={false} />
                    </TableCell>
                    <TableCell className={CELL}>
                      <UserRoleText role={u.role} />
                    </TableCell>
                    <TableCell className={cn(CELL, "max-w-[16rem] text-body-md text-on-surface-variant")}>
                      <span className="block truncate" title={u.email}>
                        {u.email}
                      </span>
                    </TableCell>
                    <TableCell
                      className={cn(
                        CELL,
                        "hidden whitespace-nowrap text-body-md tabular-nums text-on-surface-variant xl:table-cell",
                      )}
                    >
                      {formatJoined(u.created_at)}
                    </TableCell>
                    <TableCell className={CELL}>
                      <UserStatusCell user={u} />
                    </TableCell>
                    <TableCell className={cn(CELL, "pr-space-lg")}>
                      <div className="flex items-center justify-end gap-space-xs">
                        <UserViewButton user={u} onView={onView} />
                        <UserLockAction
                          user={u}
                          isSelf={isSelf}
                          saving={savingId === u.id}
                          onLock={onLock}
                          onUnlock={onUnlock}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>
    </div>
  );
}

function SkeletonRow() {
  return (
    <TableRow className="border-t border-surface-container hover:bg-transparent">
      <TableCell className={cn(CELL, "pl-space-lg")}>
        <Skeleton className="size-10 rounded-full" />
      </TableCell>
      <TableCell className={cn(CELL, "py-4")}>
        <Skeleton className="h-3 w-36 rounded-full" />
      </TableCell>
      <TableCell className={cn(CELL, "py-4")}>
        <Skeleton className="h-3 w-16 rounded-full" />
      </TableCell>
      <TableCell className={cn(CELL, "py-4")}>
        <Skeleton className="h-3 w-44 rounded-full" />
      </TableCell>
      <TableCell className={cn(CELL, "hidden py-4 xl:table-cell")}>
        <Skeleton className="h-3 w-20 rounded-full" />
      </TableCell>
      <TableCell className={cn(CELL, "py-4")}>
        <Skeleton className="h-3 w-20 rounded-full" />
      </TableCell>
      <TableCell className={cn(CELL, "py-4 pr-space-lg")}>
        <Skeleton className="ml-auto h-9 w-28 rounded-full" />
      </TableCell>
    </TableRow>
  );
}
