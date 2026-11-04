"use client";

import { usePathname } from "next/navigation";
import { HomeFooter } from "@/features/home/components/home-footer";
import { HomeHeaderMain } from "@/features/home/components/home-header-main";
import { HomeSecondaryNav } from "@/features/home/components/home-secondary-nav";
import { HomeTopbar } from "@/features/home/components/home-topbar";
import { cn } from "@/lib/utils";

export function ShopLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <div className="flex min-h-dvh flex-col bg-surface-container-lowest text-on-surface">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
        <HomeTopbar />
        <HomeHeaderMain />
        <HomeSecondaryNav />
      </header>

      <main
        className={cn(
          "w-full flex-1",
          !onHome && "mx-auto max-w-page px-4 py-6",
        )}
      >
        {children}
      </main>
      <HomeFooter />
    </div>
  );
}
