"use client";

import { Loader2, Plus, X } from "lucide-react";
import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type AuthorRef, useAuthorOptions } from "../../hooks/use-admin";
import { AuthorFormDialog } from "./author-form-dialog";

type Props = {
  /** Selected authors, in display order (= `book_authors.position`). */
  value: AuthorRef[];
  onChange: (value: AuthorRef[]) => void;
  max?: number;
  invalid?: boolean;
};

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();

/** Multi-select author combobox with inline "add new author". */
export function AuthorPicker({ value, onChange, max = 10, invalid }: Props) {
  const listId = useId();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [creating, setCreating] = useState<string | null>(null);
  const options = useAuthorOptions(q, open);

  const selectedIds = new Set(value.map((a) => a.id));
  const results = (options.data ?? []).filter((a) => !selectedIds.has(a.id));
  const term = q.trim();
  const exact = (options.data ?? []).some((a) => norm(a.name) === norm(term));
  const canCreate = term.length > 0 && !exact;
  const itemCount = results.length + (canCreate ? 1 : 0);
  const full = value.length >= max;

  const add = (a: AuthorRef) => {
    if (selectedIds.has(a.id) || full) return;
    onChange([...value, { id: a.id, name: a.name }]);
    setQ("");
    setActive(0);
  };
  const removeAt = (i: number) => onChange(value.filter((_, j) => j !== i));
  const pick = (i: number) => {
    if (i < results.length) add(results[i]);
    else if (canCreate) {
      setCreating(term);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring/50",
          invalid && "border-destructive",
        )}
      >
        {value.map((a, i) => (
          <span
            key={a.id}
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-sm text-secondary-foreground"
          >
            {a.name}
            <button
              type="button"
              aria-label={`Bỏ ${a.name}`}
              className="rounded-full hover:text-destructive"
              onClick={() => removeAt(i)}
            >
              <X className="size-3.5" />
            </button>
          </span>
        ))}
        <Input
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-invalid={invalid}
          disabled={full}
          className="h-7 min-w-40 flex-1 border-0 px-1 shadow-none focus-visible:ring-0"
          placeholder={selectedIds.size === 0 ? "Chọn tác giả" : ""}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((i) => Math.min(i + 1, Math.max(itemCount - 1, 0)));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault(); // never submit the book form from here
              if (open && itemCount > 0) pick(active);
            } else if (e.key === "Escape") {
              setOpen(false);
            } else if (e.key === "Backspace" && q === "" && value.length > 0) {
              removeAt(value.length - 1);
            }
          }}
        />
      </div>

      {open && !full && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border bg-popover p-1 text-sm shadow-md"
        >
          {options.isFetching && results.length === 0 && (
            <li className="flex items-center gap-2 px-2 py-1.5 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden /> Đang
              tìm...
            </li>
          )}
          {!options.isFetching && itemCount === 0 && (
            <li className="px-2 py-1.5 text-muted-foreground">
              Không tìm thấy tác giả
            </li>
          )}
          {results.map((a, i) => (
            <li
              key={a.id}
              role="option"
              aria-selected={i === active}
              className={cn(
                "flex cursor-pointer justify-between rounded-md px-2 py-1.5",
                i === active && "bg-muted",
              )}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(i)}
            >
              <span>{a.name}</span>
              <span className="text-xs text-muted-foreground">
                {a.book_count} sách
              </span>
            </li>
          ))}
          {canCreate && (
            <li
              role="option"
              aria-selected={active === results.length}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-primary",
                active === results.length && "bg-muted",
              )}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(results.length)}
              onClick={() => pick(results.length)}
            >
              <Plus className="size-4" aria-hidden /> Thêm tác giả «{term}»
            </li>
          )}
        </ul>
      )}

      <AuthorFormDialog
        author={creating !== null ? "new" : null}
        defaultName={creating ?? ""}
        onClose={() => setCreating(null)}
        onSaved={(a) => add(a)}
      />
    </div>
  );
}
