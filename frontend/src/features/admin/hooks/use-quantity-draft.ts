"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSetBookQuantity } from "./use-admin";

const SAVE_DELAY_MS = 500;

/**
 * Local stepper value for one book. Repeated clicks are merged: the value is saved once,
 * `SAVE_DELAY_MS` after the last change, and only if it differs from the saved quantity.
 */
export function useQuantityDraft(id: number, saved: number) {
  const mutation = useSetBookQuantity();
  const [value, setDraft] = useState(saved);
  const timer = useRef<number | undefined>(undefined);
  const pendingSave = useRef(false);

  // Follow the server value (refetch, rollback) unless a save is queued.
  useEffect(() => {
    if (!pendingSave.current) setDraft(saved);
  }, [saved]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const { mutate } = mutation;
  const setValue = useCallback(
    (next: number, immediate = false) => {
      const v = Math.max(0, Math.floor(next));
      setDraft(v);
      window.clearTimeout(timer.current);
      pendingSave.current = true;
      const save = () => {
        pendingSave.current = false;
        if (v !== saved) mutate({ id, quantity: v });
      };
      if (immediate) save();
      else timer.current = window.setTimeout(save, SAVE_DELAY_MS);
    },
    [id, saved, mutate],
  );

  const step = useCallback((delta: number) => setValue(value + delta), [setValue, value]);

  return { value, setValue, step, saving: mutation.isPending };
}
