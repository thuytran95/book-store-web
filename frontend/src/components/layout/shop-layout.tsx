"use client";

import { BookOpen, Home, LogOut, Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useLogout } from "@/features/auth/hooks";
import { useCartCount } from "@/features/cart/hooks";
import { useCategories } from "@/features/catalog/hooks";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

function SearchBar({ className, onDone }: { className?: string; onDone?: () => void }) {
  const router = useRouter();
  const [text, setText] = useState("");
  return (
    <form
      role="search"
      className={cn("flex gap-2", className)}
      onSubmit={(e) => {
        e.preventDefault();
        const t = text.trim();
        router.push(t ? `/books?text=${encodeURIComponent(t)}` : "/books");
        onDone?.();
      }}
    >
      <Input
        aria-label="Tìm sách"
        placeholder="Tìm theo tên sách, tác giả…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button type="submit" size="icon" aria-label="Tìm kiếm">
        <Search />
      </Button>
    </form>
  );
}

function CartLink() {
  const count = useCartCount();
  return (
    <Link href="/cart" aria-label={`Giỏ hàng (${count})`} className="relative inline-flex p-2">
      <ShoppingCart className="size-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
          {count}
        </span>
      )}
    </Link>
  );
}

function UserMenu() {
  const { session, isLoading } = useSession();
  const router = useRouter();
  const logout = useLogout();

  if (isLoading) return <div className="h-8 w-20" aria-hidden />;
  if (!session) {
    return (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" render={<Link href="/login" />}>
          Đăng nhập
        </Button>
        <Button size="sm" className="hidden sm:inline-flex" render={<Link href="/register" />}>
          Đăng ký
        </Button>
      </div>
    );
  }
  const items: [string, string][] = [
    ["Hồ sơ", "/account/profile"],
    ["Địa chỉ", "/account/addresses"],
    ["Đơn hàng", "/orders"],
    ["Sách đang giữ", "/reservations"],
    ["Yêu cầu tìm sách", "/book-requests"],
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
        <User />
        <span className="hidden max-w-28 truncate sm:inline">{session.user.full_name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map(([label, href]) => (
          <DropdownMenuItem key={href} onClick={() => router.push(href)}>
            {label}
          </DropdownMenuItem>
        ))}
        {session.role === "admin" && (
          <DropdownMenuItem onClick={() => router.push("/admin")}>Quản trị</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout.mutate()}>
          <LogOut /> Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const BOTTOM_NAV = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/books", label: "Sách", icon: BookOpen },
  { href: "/cart", label: "Giỏ hàng", icon: ShoppingCart },
  { href: "/account/profile", label: "Tài khoản", icon: User },
];

export function ShopLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: categories } = useCategories();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BookOpen className="size-5 text-primary" /> Hiệu sách cũ
          </Link>
          <SearchBar className="mx-4 hidden flex-1 md:flex" />
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Tìm kiếm"
              aria-expanded={showSearch}
              onClick={() => setShowSearch((v) => !v)}
            >
              <Search />
            </Button>
            <CartLink />
            <UserMenu />
          </div>
        </div>
        {showSearch && (
          <div className="border-t px-4 py-2 md:hidden">
            <SearchBar onDone={() => setShowSearch(false)} />
          </div>
        )}
        {categories && categories.length > 0 && (
          <nav
            aria-label="Danh mục"
            className="mx-auto hidden max-w-6xl gap-4 overflow-x-auto px-4 pb-2 text-sm md:flex"
          >
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/books?category=${c.slug}`}
                className="whitespace-nowrap text-muted-foreground hover:text-foreground"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 md:pb-6">{children}</main>

      <footer className="hidden border-t py-6 text-center text-sm text-muted-foreground md:block">
        Hiệu sách cũ · Sách đã qua sử dụng, mỗi cuốn một bản duy nhất.
      </footer>

      <nav
        aria-label="Điều hướng chính"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t bg-background md:hidden"
      >
        {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 text-xs",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
