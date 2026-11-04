import type { Metadata } from "next";
import { Suspense } from "react";
import { RequestPage } from "@/features/book-requests/components/request-page";

export const metadata: Metadata = { title: "Yêu cầu tìm sách" };

export default function BookRequestsPage() {
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">Yêu cầu tìm sách</h1>
      <Suspense>
        <RequestPage />
      </Suspense>
    </div>
  );
}
