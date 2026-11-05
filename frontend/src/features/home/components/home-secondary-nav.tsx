"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { homeSectionHref } from "@/config/home";
import { useCategories } from "@/features/catalog/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/features/home/components/user-menu";
import { MaterialIcon } from "./material-icon";

export function HomeSecondaryNav() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const { data: categories } = useCategories();

  const section = (id: string) => homeSectionHref(id, onHome);

  return (
    <div className="border-t border-gray-100 bg-gray-50/80">
      <div className="mx-auto flex max-w-page items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button className="rounded-t-lg rounded-b-none bg-primary shadow-sm hover:bg-primary-container">
                  <MaterialIcon name="menu" className="text-lg" />
                  Thể loại sách
                  <MaterialIcon name="expand_more" className="text-base" />
                </Button>
              }
            />
            <DropdownMenuContent align="start" className="w-64">
              {categories?.map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  render={<Link href={`/books?category=${c.slug}`} />}
                >
                  <MaterialIcon
                    name="auto_stories"
                    className="text-base text-primary"
                  />
                  {c.name}
                </DropdownMenuItem>
              ))}
              {!categories?.length && (
                <DropdownMenuItem render={<Link href="/books" />}>
                  Khám phá sách
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <nav
            aria-label="Điều hướng chính"
            className="hidden items-center gap-6 text-sm font-semibold text-gray-700 md:flex"
          >
            <Link
              href="/"
              className="flex items-center gap-1 font-bold text-primary"
            >
              Trang chủ
            </Link>
            <Link href="/books" className="hover:text-primary">
              Kho sách
            </Link>
            <Link href={section("tac-gia")} className="hover:text-primary">
              Tác giả tiêu biểu
            </Link>
            <Link href={section("khong-gian")} className="hover:text-primary">
              Về cửa hàng
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 py-2">
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
