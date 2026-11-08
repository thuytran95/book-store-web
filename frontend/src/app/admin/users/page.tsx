import type { Metadata } from "next";
import { Suspense } from "react";
import { UsersPage } from "@/features/admin/components/user/users-page";

export const metadata: Metadata = { title: "Người dùng" };

export default function AdminUsersPage() {
  return (
    <Suspense>
      <UsersPage />
    </Suspense>
  );
}
