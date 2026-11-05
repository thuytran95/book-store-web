import type { Metadata } from "next";
import { InventoryHome } from "@/features/admin/components/inventory-home";

export const metadata: Metadata = { title: "Quản lý sách" };

export default function AdminHomePage() {
  return <InventoryHome />;
}
