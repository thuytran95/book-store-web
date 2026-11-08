import { MaterialIcon } from "@/features/home/components/material-icon";
import type { components } from "@/lib/api/schema";
import { cn } from "@/lib/utils";
import { avatarTone, initials } from "./user-meta";

type AdminUserRead = components["schemas"]["AdminUserRead"];

export function UserAvatar({
  user,
  size = "md",
}: {
  user: Pick<AdminUserRead, "id" | "full_name" | "is_locked">;
  size?: "md" | "lg";
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full text-label-md",
        size === "lg" ? "size-11" : "size-10",
        user.is_locked ? "bg-surface-container-high text-outline" : avatarTone(user.id),
      )}
    >
      {initials(user.full_name)}
      {user.is_locked && (
        <span className="absolute -bottom-0.5 -right-0.5 grid size-5 place-items-center rounded-full bg-surface-container-lowest">
          <MaterialIcon name="lock" className="text-[13px] text-on-surface-variant" />
        </span>
      )}
    </span>
  );
}

export const ROLE_LABEL: Record<AdminUserRead["role"], string> = {
  admin: "Quản trị",
  buyer: "Người mua",
};

/** Role as plain text (no badge). */
export function UserRoleText({ role }: { role: AdminUserRead["role"] }) {
  return <span className="whitespace-nowrap text-body-md text-on-surface">{ROLE_LABEL[role]}</span>;
}

export function UserNameBlock({
  user,
  isSelf,
  showRole = true,
  showEmail = true,
}: {
  user: AdminUserRead;
  isSelf: boolean;
  /** Hide the role label where role has its own column (desktop table). */
  showRole?: boolean;
  /** Hide the email line where email has its own column (desktop table). */
  showEmail?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <span
          className={cn(
            "text-label-lg",
            user.is_locked ? "text-on-surface-variant" : "text-on-surface",
          )}
        >
          {user.full_name}
        </span>
        {showRole && user.role === "admin" && (
          <span className="text-body-sm text-on-surface-variant">· {ROLE_LABEL.admin}</span>
        )}
        {isSelf && (
          <span className="rounded-full bg-surface-container px-2 py-0.5 text-label-sm text-on-surface-variant">
            Bạn
          </span>
        )}
      </div>
      {showEmail && (
        <div className="truncate text-body-sm text-on-surface-variant">{user.email}</div>
      )}
    </div>
  );
}
