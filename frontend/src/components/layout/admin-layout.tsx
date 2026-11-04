"use client";

import {
  BookCopy,
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Tags,
  Timer,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useLogout } from "@/features/auth/hooks";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/books", label: "Sách", icon: BookOpen },
  { href: "/admin/categories", label: "Danh mục", icon: Tags },
  { href: "/admin/orders", label: "Đơn hàng", icon: Package },
  { href: "/admin/reservations", label: "Giữ sách", icon: Timer },
  { href: "/admin/book-requests", label: "Yêu cầu tìm sách", icon: ClipboardList },
  { href: "/admin/users", label: "Người dùng", icon: Users },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Quản trị" className="grid gap-1 p-3">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
              active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            <Icon className="size-4" /> {label}
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
    <div className="flex min-h-dvh">
      <aside className="hidden w-60 shrink-0 border-r lg:block">
        <div className="flex items-center gap-2 border-b px-4 py-3 font-semibold">
          <BookCopy className="size-5 text-primary" /> Quản trị
        </div>
        <SidebarNav />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left">
          <SheetTitle className="px-4 pt-4">Quản trị</SheetTitle>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b px-4 py-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Mở menu"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </Button>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Về cửa hàng
          </Link>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span>{session?.user.full_name}</span>
            <Button variant="outline" size="sm" onClick={() => logout.mutate()}>
              <LogOut /> Đăng xuất
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
