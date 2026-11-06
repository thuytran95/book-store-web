"use client";

import { cloneElement, isValidElement, useId } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  /** A single input-like element; receives id, aria-invalid and aria-describedby. */
  children: React.ReactElement<Record<string, unknown>>;
};

/** Label + control + error/hint wrapper for react-hook-form fields. */
export function FormField({
  label,
  error,
  hint,
  required,
  className,
  children,
}: Props) {
  const id = useId();
  const descId = `${id}-desc`;
  const control = isValidElement(children)
    ? cloneElement(children, {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error || hint ? descId : undefined,
      })
    : children;
  return (
    <div className={cn("grid gap-4", className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {control}
      {(error || hint) && (
        <p
          id={descId}
          role={error ? "alert" : undefined}
          className={cn(
            "text-xs",
            error ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
