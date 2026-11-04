import { toast as sonner } from "sonner";

export type ToastKind = "success" | "error" | "info";

/** Thin wrapper over sonner so hooks do not depend on UI details. `<Toaster />` is in the root layout. */
export function toast(message: string, kind: ToastKind = "info") {
  if (kind === "success") sonner.success(message);
  else if (kind === "error") sonner.error(message);
  else sonner(message);
}

toast.success = (m: string) => sonner.success(m);
toast.error = (m: string) => sonner.error(m);
