import type { Metadata } from "next";
import { Dashboard } from "@/features/admin/components/dashboard";

export const metadata: Metadata = { title: "Tổng quan quản trị" };

export default function AdminHomePage() {
  return <Dashboard />;
}
