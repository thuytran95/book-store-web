import { redirect } from "next/navigation";
import { getSession } from "@/lib/session-server";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Logged-in users have no business here (reset-password included).
  if (await getSession()) redirect("/");
  return (
    <main className="grid min-h-dvh place-items-center bg-muted/30 p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-background p-6 shadow-sm">{children}</div>
    </main>
  );
}
