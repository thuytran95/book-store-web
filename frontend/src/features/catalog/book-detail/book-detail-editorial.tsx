"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { pdpSurface } from "./pdp-styles";

const COLLAPSED_LINES = 6;

export function BookDetailEditorial({
  description,
  collapsedLines = COLLAPSED_LINES,
  conditionPct,
}: {
  description: string;
  collapsedLines?: number;
  conditionPct: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const bodyId = useId();
  const lineCount = description.split("\n").length;
  const needsExpand = lineCount > collapsedLines || description.length > 480;

  return (
    <section className={cn(pdpSurface(), "space-y-4 p-5")} aria-labelledby="pdp-desc-heading">
      <h2 id="pdp-desc-heading" className="text-headline-md font-semibold">
        Mô tả tác phẩm & khảo cứu
      </h2>
      <div
        id={bodyId}
        className={cn(
          "whitespace-pre-line text-sm leading-relaxed text-muted-foreground",
          !expanded && needsExpand && "line-clamp-6",
        )}
      >
        {description}
      </div>
      {needsExpand && (
        <button
          type="button"
          className="text-sm font-semibold text-primary hover:underline"
          aria-expanded={expanded}
          aria-controls={bodyId}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Thu gọn" : "Đọc thêm khảo cứu văn bản"}
        </button>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-muted/60 p-4 text-sm">
          <p className="font-semibold text-foreground">Độ hiếm</p>
          <p className="mt-1 text-muted-foreground">
            Ấn phẩm được phân loại theo thể loại và tình trạng lưu trữ; mức hiếm phụ thuộc nguồn gốc và số lượng
            tồn kho thực tế.
          </p>
        </div>
        <div className="rounded-xl bg-muted/60 p-4 text-sm">
          <p className="font-semibold text-foreground">Trạng thái bảo tồn</p>
          <p className="mt-1 text-muted-foreground">
            Giám định ghi nhận nguyên bản {conditionPct}% — phù hợp trưng bày và đọc có kiểm soát môi trường.
          </p>
        </div>
      </div>
    </section>
  );
}
