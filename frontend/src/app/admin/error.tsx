"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid justify-items-start gap-3 py-10">
      <h1 className="text-xl font-semibold">Không tải được trang quản trị</h1>
      <Button onClick={reset}>Thử lại</Button>
    </div>
  );
}
