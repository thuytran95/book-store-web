"use client";

import { BookOpen } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Img = { id: number; url: string };

export function BookGallery({ images, title, fallback }: { images: Img[]; title: string; fallback?: string | null }) {
  const list: Img[] = images.length > 0 ? images : fallback ? [{ id: 0, url: fallback }] : [];
  const [active, setActive] = useState(0);

  if (list.length === 0) {
    return (
      <div className="grid aspect-[3/4] place-items-center rounded-xl bg-muted text-muted-foreground">
        <BookOpen className="size-12" aria-hidden />
        <span className="sr-only">Chưa có ảnh</span>
      </div>
    );
  }
  return (
    <div className="grid gap-3">
      <div className="aspect-[3/4] overflow-hidden rounded-xl bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={list[active].url} alt={title} className="size-full object-cover" />
      </div>
      {list.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto">
          {list.map((img, i) => (
            <li key={img.id}>
              <button
                type="button"
                aria-label={`Xem ảnh ${i + 1}`}
                aria-current={i === active}
                onClick={() => setActive(i)}
                className={cn("h-20 w-16 overflow-hidden rounded-md border-2", i === active ? "border-primary" : "border-transparent")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" loading="lazy" className="size-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
