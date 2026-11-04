"use client";

import { Button } from "@/components/ui/button";

export default function RootError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div className="grid gap-3">
        <h1 className="text-2xl font-bold">Đã có lỗi xảy ra</h1>
        <p className="text-sm text-muted-foreground">Không thể tải trang. Vui lòng thử lại.</p>
        <Button onClick={reset}>Thử lại</Button>
      </div>
    </main>
  );
}
