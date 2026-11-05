import type { Metadata } from "next";
import { Dashboard } from "@/features/admin/components/report/dashboard";

export const metadata: Metadata = { title: "Báo cáo & thống kê" };

export default function AdminReportsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
      <Dashboard />
    </div>
  );
}
