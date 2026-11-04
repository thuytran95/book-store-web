"use client";

import { BookOpen, ZoomIn } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { pdpStage, pdpSurface } from "./pdp-styles";

type Img = { id: number; url: string };

export function BookDetailGallery({
  images,
  title,
  fallbackCover,
  badgeText,
}: {
  images: Img[];
  title: string;
  fallbackCover?: string | null;
  badgeText?: string;
}) {
  const list: Img[] = useMemo(() => {
    if (images.length > 0) return images;
    if (fallbackCover) return [{ id: 0, url: fallbackCover }];
    return [];
  }, [images, fallbackCover]);

  const [active, setActive] = useState(0);
  const activeUrl = list[active]?.url;
  const thumbs = list.slice(0, 5);
  const overflow = list.length > 5;

  if (list.length === 0) {
    return (
      <div className={cn(pdpStage, "grid aspect-[4/5] place-items-center text-muted-foreground")}>
        <BookOpen className="size-12" aria-hidden />
        <p className="text-sm">Chưa có ảnh</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className={cn(pdpStage, "relative aspect-[4/5] overflow-hidden")}>
        {badgeText && (
          <span className="absolute top-3 left-3 z-10 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
            {badgeText}
          </span>
        )}
        <div className="group relative flex size-full items-center justify-center p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeUrl}
            alt={title}
            className="max-h-full max-w-full object-contain shadow-book transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
        {activeUrl && (
          <a
            href={activeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur hover:bg-background"
          >
            <ZoomIn className="size-3.5" aria-hidden />
            Phóng to
          </a>
        )}
      </div>
      {(thumbs.length > 1 || overflow) && (
        <ul className="grid grid-cols-5 gap-2">
          {thumbs.map((img, i) => (
            <li key={img.id}>
              <button
                type="button"
                aria-label={`Xem ảnh ${i + 1}`}
                aria-current={i === active}
                onClick={() => setActive(i)}
                className={cn(
                  "aspect-square overflow-hidden rounded-lg bg-muted p-0.5 transition-opacity",
                  i === active ? "ring-2 ring-primary ring-offset-2" : "opacity-70 hover:opacity-100",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" loading="lazy" className="size-full rounded-md object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {overflow && (
        <p className="text-center text-xs text-muted-foreground">
          +{list.length - 5} ảnh — cuộn trong thư viện đầy đủ (sắp ra mắt)
        </p>
      )}
    </div>
  );
}

export function BookDetailGalleryShell({ className }: { className?: string }) {
  return <div className={cn(pdpSurface(), "animate-pulse aspect-[4/5] bg-muted", className)} />;
}
