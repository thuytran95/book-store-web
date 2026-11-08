import { toast as sonner } from "sonner";

export type ToastKind = "success" | "error" | "info";

export type ToastOptions = {
  /** Button inside the toast, e.g. "Hoàn tác". */
  action?: { label: string; onClick: () => void };
  /** Milliseconds; defaults to sonner's. */
  duration?: number;
};

/** Thin wrapper over sonner so hooks do not depend on UI details. `<Toaster />` is in the root layout. */
export function toast(message: string, kind: ToastKind = "info", options?: ToastOptions) {
  if (kind === "success") sonner.success(message, options);
  else if (kind === "error") sonner.error(message, options);
  else sonner(message, options);
}

toast.success = (m: string, options?: ToastOptions) => sonner.success(m, options);
toast.error = (m: string, options?: ToastOptions) => sonner.error(m, options);
