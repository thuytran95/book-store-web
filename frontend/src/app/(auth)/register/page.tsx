import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/features/auth/components/auth-forms";

export const metadata: Metadata = { title: "Đăng ký" };

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
