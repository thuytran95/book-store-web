import { MaterialIcon } from "@/features/home/components/material-icon";
import type { components } from "@/lib/api/schema";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { lockBlockedReason } from "./user-meta";

type AdminUserRead = components["schemas"]["AdminUserRead"];

export function UserStatusCell({ user }: { user: AdminUserRead }) {
  if (!user.is_locked) {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-label-md text-on-secondary-container">
        <span className="size-2 rounded-full bg-on-secondary-container" />
        Hoạt động
      </span>
    );
  }
  return (
    <span className="inline-flex flex-col">
      <span className="inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full bg-surface-container-high px-2.5 py-0.5 text-label-md text-on-surface-variant">
        <MaterialIcon name="lock" className="text-[16px]" />
        Đã khóa
      </span>
      {user.locked_at && (
        <span className="mt-0.5 whitespace-nowrap text-body-sm text-on-surface-variant">
          từ {formatDate(user.locked_at, false)}
        </span>
      )}
    </span>
  );
}

/** Round icon button that opens the user info dialog. */
export function UserViewButton({
  user,
  onView,
  className,
}: {
  user: AdminUserRead;
  onView: (u: AdminUserRead) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onView(user)}
      aria-label={`Xem thông tin ${user.full_name}`}
      title="Xem thông tin"
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary",
        className,
      )}
    >
      <MaterialIcon name="visibility" className="text-[20px]" />
    </button>
  );
}

function Spinner() {
  return (
    <span
      aria-label="Đang lưu"
      className="inline-block size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}

export function UserLockAction({
  user,
  isSelf,
  saving,
  block = false,
  onLock,
  onUnlock,
}: {
  user: AdminUserRead;
  isSelf: boolean;
  saving: boolean;
  /** Full-width 44 px button (mobile cards). */
  block?: boolean;
  onLock: (u: AdminUserRead) => void;
  onUnlock: (u: AdminUserRead) => void;
}) {
  const size = block ? "min-h-11 w-full justify-center px-space-lg" : "min-h-9 px-space-md";

  if (user.is_locked) {
    return (
      <button
        type="button"
        disabled={saving}
        onClick={() => onUnlock(user)}
        className={cn(
          "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-primary-container text-label-lg text-on-primary transition-colors hover:bg-primary disabled:opacity-60",
          size,
        )}
      >
        {saving ? <Spinner /> : <MaterialIcon name="lock_open" className="text-[18px]" />}
        Mở khóa
      </button>
    );
  }

  const blocked = lockBlockedReason(user, isSelf);
  if (blocked) {
    return (
      <span title={blocked} className="text-body-sm text-on-surface-variant">
        —<span className="sr-only">{blocked}</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={saving}
      onClick={() => onLock(user)}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-surface-container-low text-label-lg text-on-surface-variant transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-60",
        size,
      )}
    >
      {saving ? <Spinner /> : <MaterialIcon name="lock" className="text-[18px]" />}
      Khóa
    </button>
  );
}
