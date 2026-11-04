import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Item = { label: string; href?: string };

export function BookDetailBreadcrumb({
  items,
  className,
}: {
  items: Item[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("mx-auto max-w-7xl overflow-x-auto px-4 pb-2 text-sm text-muted-foreground", className)}
    >
      <ol className="flex min-w-0 items-center gap-1 whitespace-nowrap">
        <li className="flex shrink-0 items-center gap-1">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-primary hover:underline">
            <Home className="size-3.5" aria-hidden />
            Trang chủ
          </Link>
        </li>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex min-w-0 items-center gap-1">
              <ChevronRight className="size-3.5 shrink-0 opacity-50" aria-hidden />
              {last || !item.href ? (
                <span className="truncate font-medium text-foreground" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="truncate hover:text-primary hover:underline">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
