"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { CART_KEY } from "@/features/cart/hooks/use-cart";

export type PlaceOrderIn = components["schemas"]["PlaceOrderIn"];
export type OrderDetail = components["schemas"]["OrderDetail"];
export type OrderSummary = components["schemas"]["OrderSummary"];

/**
 * Place an order from the cart. Errors (switch on `ApiError.code`):
 * - OUT_OF_STOCK: `details.book_id`, `requested`, `available`
 * - CART_EMPTY, BOOK_UNAVAILABLE, VALIDATION_ERROR
 */
export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: PlaceOrderIn) => {
      const { data } = await api.POST("/api/v1/orders", { body });
      return data!;
    },
    onSettled: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: CART_KEY }),
        qc.invalidateQueries({ queryKey: ["orders"] }),
        qc.invalidateQueries({ queryKey: ["book"] }),
        qc.invalidateQueries({ queryKey: ["books"] }),
      ]),
  });
}

export function useOrders(page = 1, size = 10) {
  return useQuery({
    queryKey: ["orders", page],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/orders", { params: { query: { page, size } } });
      return data!;
    },
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: ["order", id],
    enabled: Number.isFinite(id),
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/orders/{order_id}", {
        params: { path: { order_id: id } },
      });
      return data!;
    },
  });
}

/** Errors: INVALID_TRANSITION (order no longer pending). */
export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason?: string }) => {
      const { data } = await api.POST("/api/v1/orders/{order_id}/cancel", {
        params: { path: { order_id: id } },
        body: { reason: reason || null },
      });
      return data!;
    },
    onSettled: (_d, _e, { id }) =>
      Promise.all([
        qc.invalidateQueries({ queryKey: ["order", id] }),
        qc.invalidateQueries({ queryKey: ["orders"] }),
        qc.invalidateQueries({ queryKey: ["book"] }),
      ]),
  });
}
