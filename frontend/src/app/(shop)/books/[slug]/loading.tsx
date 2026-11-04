import { BookDetailGalleryShell } from "@/features/catalog/book-detail/book-detail-gallery";
import { pdpSurface } from "@/features/catalog/book-detail/pdp-styles";

export default function BookDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-8 px-4 py-6">
      <div className="h-4 w-2/3 rounded bg-muted" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <BookDetailGalleryShell />
        </div>
        <div className="space-y-4 lg:col-span-5">
          <div className={pdpSurface() + " h-48 bg-muted"} />
          <div className={pdpSurface() + " h-32 bg-muted"} />
        </div>
        <div className="lg:col-span-3">
          <div className={pdpSurface() + " h-64 bg-muted"} />
        </div>
      </div>
    </div>
  );
}
