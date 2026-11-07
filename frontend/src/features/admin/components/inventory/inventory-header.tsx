import { LinkButton } from "@/components/shared/link-button";
import { Skeleton } from "@/components/ui/skeleton";
import { MaterialIcon } from "@/features/home/components/material-icon";
import type { components } from "@/lib/api/schema";

type InventoryOverview = components["schemas"]["InventoryOverview"];

export function InventoryHeader({
  overview,
  isLoading,
}: {
  overview: InventoryOverview | undefined;
  isLoading: boolean;
}) {
  return (
    <section className="flex flex-col justify-between gap-space-md md:flex-row md:items-end">
      <div className="space-y-1">
        <h1 className="text-headline-xl tracking-tight text-primary">Kho sách</h1>
        {isLoading || !overview ? (
          <Skeleton className="h-5 w-56 rounded-full" />
        ) : (
          <p className="flex flex-wrap items-center gap-x-space-sm gap-y-1 text-body-md text-on-surface-variant">
            <span>
              <b className="font-semibold text-on-surface">{overview.total_titles}</b> đầu sách
              {" · "}
              <b className="font-semibold text-on-surface">{overview.total_copies}</b> bản
            </span>
            {overview.intake_this_week > 0 && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-secondary-container px-2 py-0.5 text-label-sm text-on-secondary-container">
                <MaterialIcon name="arrow_upward" className="text-[14px]" />
                {overview.intake_this_week} đầu sách tuần này
              </span>
            )}
          </p>
        )}
      </div>
      <LinkButton href="/admin/books/new" className="gap-1 self-start md:self-auto">
        <MaterialIcon name="add" className="text-[20px]" />
        <span className="hidden sm:inline">Thêm sách</span>
        <span className="sm:hidden">Thêm</span>
      </LinkButton>
    </section>
  );
}
