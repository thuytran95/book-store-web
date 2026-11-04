import type { Metadata } from "next";
import { AdminBookRequestsPage } from "@/features/admin/components/book-requests-page";

export const metadata: Metadata = { title: "Yêu cầu tìm sách" };

export default function Page() {
  return <AdminBookRequestsPage />;
}
