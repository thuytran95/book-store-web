import Image from "next/image";
import { cn } from "@/lib/utils";
import type { AdminInventoryRow } from "../../inventory/types";

const PLACEHOLDER = ["bg-pod-mint", "bg-pod-honey", "bg-pod-lavender", "bg-pod-sky"];

/** Cover image, or a coloured spine with the title when the book has no image (prototype look). */
export function InventoryBookCover({
  row,
  className,
  sizes,
}: {
  row: AdminInventoryRow;
  className: string;
  sizes: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex shrink-0 items-end overflow-hidden rounded-[6px] p-1 shadow-book",
        row.coverUrl ? "bg-surface-container" : PLACEHOLDER[row.id % PLACEHOLDER.length],
        className,
      )}
    >
      {row.coverUrl ? (
        <Image src={row.coverUrl} alt="" fill className="object-cover" sizes={sizes} />
      ) : (
        <>
          <span className="absolute inset-y-0 left-0 w-1 bg-black/10" />
          <span className="line-clamp-3 text-[8px] font-semibold leading-tight text-on-surface/80">
            {row.title}
          </span>
        </>
      )}
    </span>
  );
}

/** Author names as filter buttons; falls back to the cached `author` text. */
export function InventoryAuthors({
  row,
  onAuthorClick,
}: {
  row: AdminInventoryRow;
  onAuthorClick?: (authorId: number) => void;
}) {
  if (!row.authors.length) return <span>{row.author ?? "—"}</span>;
  return (
    <span>
      {row.authors.map((a, i) => (
        <span key={a.id}>
          {i > 0 && ", "}
          {onAuthorClick ? (
            <button
              type="button"
              title="Lọc theo tác giả"
              onClick={() => onAuthorClick(a.id)}
              className="hover:text-primary hover:underline"
            >
              {a.name}
            </button>
          ) : (
            a.name
          )}
        </span>
      ))}
    </span>
  );
}
