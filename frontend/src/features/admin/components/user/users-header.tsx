import { Skeleton } from "@/components/ui/skeleton";
import { MaterialIcon } from "@/features/home/components/material-icon";
import type { components } from "@/lib/api/schema";

type UserCounts = components["schemas"]["UserCounts"];

export function UsersHeader({
  counts,
  isLoading,
}: {
  counts: UserCounts | undefined;
  isLoading: boolean;
}) {
  return (
    <section className="space-y-1">
      <h1 className="text-headline-xl tracking-tight text-primary">Người dùng</h1>
      {isLoading || !counts ? (
        <Skeleton className="h-5 w-56 rounded-full" />
      ) : (
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-body-md text-on-surface-variant">
          <span>
            <b className="font-semibold tabular-nums text-on-surface">{counts.all}</b> tài khoản
            {counts.locked > 0 && (
              <>
                {" · "}
                <b className="font-semibold tabular-nums text-on-surface">{counts.locked}</b> đang
                bị khóa
              </>
            )}
          </span>
          {counts.new_this_week > 0 && (
            <span className="hidden items-center gap-0.5 rounded-full bg-secondary-container px-2 py-0.5 text-label-sm text-on-secondary-container sm:inline-flex">
              <MaterialIcon name="arrow_upward" className="text-[16px]" />
              <span className="tabular-nums">{counts.new_this_week}</span> người đăng ký tuần này
            </span>
          )}
        </p>
      )}
    </section>
  );
}
