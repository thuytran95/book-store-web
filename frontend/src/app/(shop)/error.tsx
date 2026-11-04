"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid justify-items-center gap-3 py-16 text-center">
      <h1 className="text-xl font-semibold">Đã có lỗi xảy ra</h1>
      <p className="text-sm text-muted-foreground">Không thể tải dữ liệu. Vui lòng thử lại.</p>
      <Button onClick={reset}>Thử lại</Button>
    </div>
  );
}
