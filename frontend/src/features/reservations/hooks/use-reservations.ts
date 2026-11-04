"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { useSession } from "@/lib/session";

export type Reservation = components["schemas"]["ReservationRead"];

export function useReservations() {
  const { session } = useSession();
  return useQuery({
    queryKey: ["reservations"],
    enabled: Boolean(session),
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/reservations");
      return data ?? [];
    },
  });
}

/** Errors: OUT_OF_STOCK, RESERVATION_LIMIT, BOOK_UNAVAILABLE. Refreshes book availability. */
export function useReserve() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookId, quantity = 1 }: { bookId: number; quantity?: number }) => {
      const { data } = await api.POST("/api/v1/reservations", {
        body: { book_id: bookId, quantity },
      });
      return data!;
    },
    onSettled: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: ["reservations"] }),
        qc.invalidateQueries({ queryKey: ["book"] }),
        qc.invalidateQueries({ queryKey: ["books"] }),
      ]),
  });
}

/** Errors: RESERVATION_NOT_ACTIVE. */
export function useCancelReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.POST("/api/v1/reservations/{reservation_id}/cancel", {
        params: { path: { reservation_id: id } },
      });
    },
    onSettled: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: ["reservations"] }),
        qc.invalidateQueries({ queryKey: ["book"] }),
        qc.invalidateQueries({ queryKey: ["books"] }),
      ]),
  });
}

export type Countdown = {
  /** Milliseconds left (0 when expired). */
  remainingMs: number;
  expired: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/** Ticks every second until `expiresAt` passes. */
export function useCountdown(expiresAt: string | Date): Countdown {
  const target = new Date(expiresAt).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (Date.now() >= target) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= target) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  const remainingMs = Math.max(0, target - now);
  const total = Math.floor(remainingMs / 1000);
  return {
    remainingMs,
    expired: remainingMs === 0,
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}
