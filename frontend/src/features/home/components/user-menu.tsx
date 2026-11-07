"use client";

import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/features/auth/hooks";
import { useSession } from "@/lib/session";
import { LinkButton } from "@/components/shared/link-button";

export function UserMenu() {
  const { session, isLoading } = useSession();
  const router = useRouter();
  const logout = useLogout();

  if (isLoading) return <div className="h-8 w-20" aria-hidden />;
  if (!session) {
    return (
      <div className="flex items-center gap-1">
        <LinkButton href="/login" variant="outline" size="sm">
          Đăng nhập
        </LinkButton>
        <LinkButton href="/register" size="sm" className="hidden sm:inline-flex">
          Đăng ký
        </LinkButton>
      </div>
    );
  }

  const items: [string, string][] = [
    ["Hồ sơ", "/account/profile"],
    ["Đơn hàng", "/orders"],
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
