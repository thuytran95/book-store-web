import type { Metadata } from "next";
import { UsersPage } from "@/features/admin/components/users-page";

export const metadata: Metadata = { title: "Người dùng" };

export default function AdminUsersPage() {
  return <UsersPage />;
}
