import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64" />
    </div>
  );
}
