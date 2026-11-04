"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { homeContent } from "@/config/home";
import { useCategories } from "@/features/catalog/hooks";
import { useCart } from "@/features/cart/hooks";
import { formatVnd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "./material-icon";

function HeaderSearchForm({
  className,
  onDone,
}: {
  className?: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const { data: categories } = useCategories();
  const [category, setCategory] = useState("");
  const [text, setText] = useState("");

  return (
    <form
      role="search"
      className={cn(
        "flex w-full items-center overflow-hidden rounded-full border border-black bg-white shadow-sm focus-within:ring-2 focus-within:ring-primary/20",
        className,
      )}
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        const t = text.trim();
        if (t) params.set("text", t);
        if (category) params.set("category", category);
        router.push(params.size ? `/books?${params}` : "/books");
        onDone?.();
      }}
    >
      <NativeSelect
        aria-label="Thể loại"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="max-w-[11rem] border-0 border-r border-black/40 bg-gray-50 text-xs font-semibold"
      >
        <option value="">Tất cả thể loại</option>
        {categories?.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </NativeSelect>
      <Input
        aria-label="Tìm sách"
        placeholder="Tìm tựa sách xưa, tác giả, năm in, thủ bản quý..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 border-0 shadow-none focus-visible:ring-0"
      />
      <Button
        type="submit"
        className="rounded-none bg-primary px-6 hover:bg-primary-container"
      >
        <MaterialIcon name="search" className="text-lg text-white" />
        <span className="sr-only">Tìm kiếm</span>
      </Button>
    </form>
  );
}

export function HomeHeaderMain() {
  const { brand, shop } = homeContent;
  const { count, total } = useCart();

  return (
    <div className="mx-auto flex max-w-page items-center justify-between gap-6 px-4 py-3.5">
      <Link href="/" className="group flex shrink-0 items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-md transition-colors group-hover:bg-primary-container">
          <MaterialIcon
            name="menu_book"
            className="text-2xl text-primary-fixed"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-primary">
            {brand.name}
          </span>
          <span className="text-[10px] font-bold tracking-widest text-primary-container uppercase">
            {brand.tagline}
          </span>
        </div>
      </Link>

      <div className="hidden max-w-2xl flex-1 lg:flex">
        <HeaderSearchForm />
      </div>

      <div className="flex shrink-0 items-center gap-5">
        <div className="hidden items-center gap-3 border-r border-gray-200 pr-5 sm:flex">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
            <MaterialIcon name="phone_in_talk" className="text-xl" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-500">
              Tư vấn thẩm định
            </p>
            <p className="text-sm font-bold text-primary">{shop.hotline}</p>
          </div>
        </div>
        <Link
          href="/cart"
          className="flex items-center gap-2.5 rounded-full px-3 py-1.5 transition-colors hover:bg-gray-100"
          aria-label={`Giỏ hàng (${count})`}
        >
          <div className="relative">
            <MaterialIcon
              name="shopping_bag"
              className="text-2xl text-gray-800"
            />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent-warm text-[10px] font-bold text-white shadow-sm">
                {count}
              </span>
            )}
          </div>
          <div className="hidden flex-col text-left md:flex">
            <span className="text-[11px] font-medium text-gray-500">
              Giỏ hàng
            </span>
            <span className="text-xs font-bold text-primary">
              {formatVnd(total)}
            </span>
          </div>
        </Link>
        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Tìm kiếm"
              />
            }
          >
            <MaterialIcon name="search" />
          </SheetTrigger>
          <SheetContent side="top" className="pt-12">
            <SheetHeader>
              <SheetTitle>Tìm sách</SheetTitle>
            </SheetHeader>
            <HeaderSearchForm className="mt-4" />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
