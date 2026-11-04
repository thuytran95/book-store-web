"use client";

import { MaterialIcon } from "@/features/home/components/material-icon";
import { PDP_STATIC } from "./pdp-static-copy";
import { pdpStage } from "./pdp-styles";

export function BookDetailHighlights() {

  const scrollToDescription = () => {
    document.getElementById("mo-ta")?.scrollIntoView({ behavior: "smooth" });
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
      } catch {
        /* user cancelled */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="grid gap-3">
      <div className={pdpStage + " space-y-2.5 p-3.5"}>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
          <MaterialIcon name="verified_user" className="text-lg" />
          Đặc điểm nổi bật & Giám định cổ thư
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {PDP_STATIC.appraisalBullets.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-secondary" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <button
          type="button"
          onClick={scrollToDescription}
          className="inline-flex items-center gap-1.5 hover:text-primary"
        >
          <MaterialIcon name="menu_book" className="text-lg" />
          Xem tóm tắt nội dung
        </button>
        <button
          type="button"
          onClick={() => void share()}
          className="inline-flex items-center gap-1.5 hover:text-primary"
        >
          <MaterialIcon name="share" className="text-lg" />
          Chia sẻ ấn phẩm
        </button>
      </div>
    </div>
  );
}
