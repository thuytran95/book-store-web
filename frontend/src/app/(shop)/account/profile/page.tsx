import type { Metadata } from "next";
import { ProfileForm } from "@/features/account/components/profile-form";

export const metadata: Metadata = { title: "Hồ sơ của tôi" };

export default function ProfilePage() {
  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-bold">Hồ sơ</h1>
      <ProfileForm />
    </div>
  );
}
