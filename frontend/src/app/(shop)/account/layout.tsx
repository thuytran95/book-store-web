"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/account/profile", label: "Hồ sơ" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="grid gap-6 md:grid-cols-[12rem_1fr]">
      <nav aria-label="Tài khoản" className="flex gap-2 md:grid md:content-start">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            aria-current={pathname === t.href ? "page" : undefined}
            className={cn(
              "rounded-lg px-3 py-2 text-sm",
              pathname === t.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <div>{children}</div>
    </div>
  );
}
