import { redirect } from "next/navigation";

/** Old detail links open the drawer on the list page. */
export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/orders?order=${encodeURIComponent(id)}`);
}
