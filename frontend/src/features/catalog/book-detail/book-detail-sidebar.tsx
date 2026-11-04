import Link from "next/link";
import { MaterialIcon } from "@/features/home/components/material-icon";
import { PDP_STATIC } from "./pdp-static-copy";
import { pdpSurface } from "./pdp-styles";

function authorInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function BookDetailSidebar({
  author,
  authorBio = "Thông tin tiểu sử chi tiết sẽ được bổ sung trong các bản cập nhật kho sách.",
}: {
  author?: string | null;
  authorBio?: string;
}) {
  const worksHref = author ? `/books?text=${encodeURIComponent(author)}` : undefined;

  return (
    <aside className="grid gap-4">
      {author && (
        <div className={pdpSurface() + " space-y-3 p-5"}>
          <div className="flex items-center gap-3">
            <div
              className="grid size-12 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary"
              aria-hidden
            >
              {authorInitials(author)}
            </div>
            <div>
              <p className="font-semibold">{author}</p>
              <p className="text-xs text-muted-foreground">Tác giả</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{authorBio}</p>
          {worksHref && (
            <Link href={worksHref} className="inline-flex text-sm font-semibold text-primary hover:underline">
              Xem trọn bộ tác phẩm liên quan →
            </Link>
          )}
        </div>
      )}
      <div className={pdpSurface() + " space-y-3 p-5"}>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <MaterialIcon name="thermostat" className="text-lg text-secondary" />
          Hướng dẫn bảo quản
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {PDP_STATIC.preservationTips.map((tip) => (
            <li key={tip} className="flex gap-2">
              <span className="text-secondary">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
