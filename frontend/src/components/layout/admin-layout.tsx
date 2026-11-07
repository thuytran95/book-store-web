"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MaterialIcon } from "@/features/home/components/material-icon";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useLogout } from "@/features/auth/hooks";
import { useInventoryOverview } from "@/features/admin/hooks/use-admin";
import { useSession } from "@/lib/session";
import { formatCompactCount } from "@/lib/format";
import { cn } from "@/lib/utils";

const PRIMARY_LINKS = [
  { href: "/admin", label: "Quản lý sách", icon: "inventory_2", exact: true },
  { href: "/admin/categories", label: "Thể loại sách", icon: "account_tree" },
  { href: "/admin/authors", label: "Tác giả", icon: "history_edu" },
] as const;

const EXTRA_LINKS = [
  { href: "/admin/orders", label: "Đơn hàng", icon: "package_2" },
  { href: "/admin/users", label: "Người dùng", icon: "group" },
] as const;

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const overview = useInventoryOverview();

  return (
    <>
      <div className="flex flex-col">
        <div className="flex h-20 items-center px-space-lg">
          <div className="flex items-center gap-space-sm">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary shadow-sm">
              <MaterialIcon
                name="auto_stories"
                filled
                className="text-[20px] text-on-primary"
              />
            </div>
            <div>
              <span className="block text-headline-sm leading-tight text-primary">
                Sách Xưa & Nay
              </span>
              <span className="text-label-sm text-on-surface-variant">
                Hiệu sách di sản
              </span>
            </div>
          </div>
        </div>
        <div className="px-space-md pt-space-xs">
          <NavGroup
            links={PRIMARY_LINKS}
            pathname={pathname}
            onNavigate={onNavigate}
          />
          <div className="my-space-sm border-t border-outline-variant/30" />
          <NavGroup
            links={EXTRA_LINKS}
            pathname={pathname}
            onNavigate={onNavigate}
            muted
          />
        </div>
      </div>
      <div className="p-space-md">
        <div className="rounded-lg bg-surface-container-low p-space-md shadow-[0_2px_8px_rgba(27,77,62,0.04)]">
          <div className="mb-space-xs flex items-center justify-between">
            <span className="text-label-md font-semibold text-on-surface">
              Trạng thái kho
            </span>
            <span className="inline-flex items-center rounded-full bg-secondary-container px-space-xs py-0.5 text-label-sm text-on-secondary-container">
              Hoạt động
            </span>
          </div>
          {overview.data ? (
            <div className="space-y-space-xs">
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-on-surface-variant">
                  Tổng trữ lượng
                </span>
                <span className="text-label-md font-bold text-primary">
                  {formatCompactCount(overview.data.total_copies)} cuốn
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-on-surface-variant">
                  Đã gán thể loại
                </span>
                <span className="text-label-md font-semibold text-secondary">
                  {overview.data.categorized_pct}%
                </span>
              </div>
              <div className="mt-space-xs h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
                <div
                  className="h-1.5 rounded-full bg-secondary"
                  style={{
                    width: `${Math.min(100, overview.data.categorized_pct)}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="h-16 animate-pulse rounded bg-surface-container-highest/50" />
          )}
        </div>
      </div>
    </>
  );
}

function NavGroup({
  links,
  pathname,
  onNavigate,
  muted,
}: {
  links: readonly {
    href: string;
    label: string;
    icon: string;
    exact?: boolean;
  }[];
  pathname: string;
  onNavigate?: () => void;
  muted?: boolean;
}) {
  return (
    <nav className="flex flex-col gap-space-xs" aria-label="Quản trị">
      {links.map(({ href, label, icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-space-sm rounded-full px-space-md py-space-sm text-label-lg transition-all",
              active
                ? "bg-primary font-label-lg text-on-primary shadow-[0_8px_24px_-4px_rgba(27,77,62,0.12)]"
                : muted
                  ? "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
            )}
          >
            <MaterialIcon
              name={icon}
              className={cn(
                "text-[20px]",
                active ? "text-on-primary" : undefined,
              )}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { session } = useSession();
  const logout = useLogout();

  return (
    <div className="min-h-dvh bg-background font-body-md text-on-surface antialiased">
      <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-72 flex-col justify-between bg-surface-container-lowest shadow-[0_8px_24px_-4px_rgba(27,77,62,0.06)] lg:flex">
        <SidebarBody />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="w-72 bg-surface-container-lowest p-0"
        >
          <SheetTitle className="sr-only">Menu quản trị</SheetTitle>
          <div className="flex h-full flex-col justify-between">
            <SidebarBody onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="lg:pl-72">
        <header className="fixed left-0 right-0 top-0 z-30 flex h-20 items-center justify-between bg-surface-container-lowest/90 px-space-xl shadow-[0_1px_12px_rgba(27,77,62,0.04)] backdrop-blur-xl lg:left-72">
          <div className="flex flex-1 items-center gap-space-lg">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Mở menu"
              onClick={() => setOpen(true)}
            >
              <MaterialIcon name="menu" />
            </Button>
            <Link
              href="/"
              className="hidden text-on-surface-variant hover:text-primary sm:inline"
            >
              ← Về cửa hàng
            </Link>
          </div>
          <div className="flex items-center gap-space-md">
            <button
              type="button"
              className="relative flex size-10 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant transition-all hover:bg-surface-container hover:text-on-surface"
              aria-label="Thông báo"
            >
              <MaterialIcon name="notifications" className="text-[20px]" />
              <span className="absolute right-1 top-1 size-2.5 rounded-full bg-tertiary-fixed-dim ring-2 ring-surface-container-lowest" />
            </button>
            <div className="flex items-center gap-space-sm pl-space-xs">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary">
                <MaterialIcon
                  name="person"
                  className="text-[18px] text-on-primary"
                />
              </div>
              <div className="hidden flex-col text-left sm:flex">
                <span className="text-label-md font-bold leading-tight text-on-surface">
                  {session?.user.full_name ?? "Quản trị"}
                </span>
                <span className="text-label-sm text-on-surface-variant">
                  Quản lý cửa hàng
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-1 hidden md:inline-flex"
                onClick={() => logout.mutate()}
              >
                Đăng xuất
              </Button>
            </div>
          </div>
        </header>
        <main className="min-h-screen w-full bg-background px-10 pt-32 pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}
