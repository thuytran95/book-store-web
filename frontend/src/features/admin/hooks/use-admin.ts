"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

type S = components["schemas"];
export type BookCreate = S["BookCreate"];
export type BookUpdate = S["BookUpdate"];
export type OrderStatus = S["OrderStatus"];
export type ReservationStatus = S["ReservationStatus"];
export type BookRequestStatus = S["BookRequestStatus"];
export type Granularity = S["Granularity"];

const invalidate = (qc: ReturnType<typeof useQueryClient>, ...keys: string[]) =>
  Promise.all(keys.map((k) => qc.invalidateQueries({ queryKey: [k] })));

// ---------------------------------------------------------------- Books

export type AdminBookFilters = {
  text?: string;
  category?: string;
  in_stock?: boolean;
  visible?: boolean;
  sort?: S["BookSort"];
  page?: number;
  size?: number;
};

export function useAdminBooks(filters: AdminBookFilters = {}) {
  return useQuery({
    queryKey: ["admin", "books", filters],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/admin/books", { params: { query: filters } });
      return data!;
    },
  });
}

export function useAdminBook(id: number | undefined) {
  return useQuery({
    queryKey: ["admin", "book", id],
    enabled: id !== undefined && Number.isFinite(id),
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/admin/books/{book_id}", {
        params: { path: { book_id: id! } },
      });
      return data!;
    },
  });
}

/** Create (no `id`) or update (with `id`). Stock quantity is create-only. */
export function useSaveBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { id?: number; body: BookCreate | BookUpdate }) => {
      if (v.id === undefined) {
        const { data } = await api.POST("/api/v1/admin/books", { body: v.body as BookCreate });
        return data!;
      }
      const { data } = await api.PATCH("/api/v1/admin/books/{book_id}", {
        params: { path: { book_id: v.id } },
        body: v.body as BookUpdate,
      });
      return data!;
    },
    onSuccess: () => invalidate(qc, "admin", "books", "book"),
  });
}

/** Returns `{ deleted, hidden }`: books with order history are hidden instead of deleted. */
export function useDeleteBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.DELETE("/api/v1/admin/books/{book_id}", {
        params: { path: { book_id: id } },
      });
      return data!;
    },
    onSuccess: () => invalidate(qc, "admin", "books", "book"),
  });
}

export function useToggleVisible() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, visible }: { id: number; visible: boolean }) => {
      const { data } = await api.PATCH("/api/v1/admin/books/{book_id}", {
        params: { path: { book_id: id } },
        body: { is_visible: visible },
      });
      return data!;
    },
    onSuccess: () => invalidate(qc, "admin", "books", "book"),
  });
}

export function useMarkSold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.POST("/api/v1/admin/books/{book_id}/mark-sold", {
        params: { path: { book_id: id } },
      });
      return data!;
    },
    onSuccess: () => invalidate(qc, "admin", "books", "book"),
  });
}

export function useUploadBookImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookId, file }: { bookId: number; file: File }) => {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.POST("/api/v1/admin/books/{book_id}/images", {
        params: { path: { book_id: bookId } },
        body: { file: "" },
        bodySerializer: () => fd,
      });
      return data!;
    },
    onSuccess: () => invalidate(qc, "admin", "book"),
  });
}

export function useDeleteBookImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookId, imageId }: { bookId: number; imageId: number }) => {
      await api.DELETE("/api/v1/admin/books/{book_id}/images/{image_id}", {
        params: { path: { book_id: bookId, image_id: imageId } },
      });
    },
    onSuccess: () => invalidate(qc, "admin", "book"),
  });
}

/** `ids` is the full permutation of the book's image ids; index is the new position. */
export function useReorderBookImages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookId, ids }: { bookId: number; ids: number[] }) => {
      const { data } = await api.PUT("/api/v1/admin/books/{book_id}/images", {
        params: { path: { book_id: bookId } },
        body: { ids },
      });
      return data!;
    },
    onSuccess: () => invalidate(qc, "admin", "book"),
  });
}

// ---------------------------------------------------------------- Categories

export function useAdminCategories() {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/admin/categories");
      return data ?? [];
    },
  });
}

/** Create (no `id`) or rename. Errors: CATEGORY_EXISTS. */
export function useSaveCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { id?: number; name: string }) => {
      if (v.id === undefined) {
        const { data } = await api.POST("/api/v1/admin/categories", { body: { name: v.name } });
        return data!;
      }
      const { data } = await api.PATCH("/api/v1/admin/categories/{category_id}", {
        params: { path: { category_id: v.id } },
        body: { name: v.name },
      });
      return data!;
    },
    onSuccess: () => invalidate(qc, "admin", "categories"),
  });
}

/** Errors: CATEGORY_NOT_EMPTY (retry with `moveTo`), INVALID_MOVE_TARGET. */
export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, moveTo }: { id: number; moveTo?: number }) => {
      await api.DELETE("/api/v1/admin/categories/{category_id}", {
        params: { path: { category_id: id }, query: { move_to: moveTo ?? null } },
      });
    },
    onSuccess: () => invalidate(qc, "admin", "categories", "books", "book"),
  });
}

// ---------------------------------------------------------------- Orders

export function useAdminOrders(status: OrderStatus | undefined, page = 1, code?: string) {
  return useQuery({
    queryKey: ["admin", "orders", status ?? "all", page, code ?? ""],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/admin/orders", {
        params: { query: { status: status ?? null, code: code || null, page } },
      });
      return data!;
    },
  });
}

export function useAdminOrder(id: number) {
  return useQuery({
    queryKey: ["admin", "order", id],
    enabled: Number.isFinite(id),
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/admin/orders/{order_id}", {
        params: { path: { order_id: id } },
      });
      return data!;
    },
  });
}

/** Errors: INVALID_TRANSITION, OUT_OF_STOCK. Only offer `allowed_transitions` from the order. */
export function useTransitionOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, to, reason }: { id: number; to: OrderStatus; reason?: string }) => {
      const { data } = await api.POST("/api/v1/admin/orders/{order_id}/transition", {
        params: { path: { order_id: id } },
        body: { to, reason: reason || null },
      });
      return data!;
    },
    onSettled: () => invalidate(qc, "admin", "order", "orders", "book", "books"),
  });
}

// ---------------------------------------------------------------- Reservations and requests

export function useAdminReservations(status?: ReservationStatus, page = 1) {
  return useQuery({
    queryKey: ["admin", "reservations", status ?? "all", page],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/admin/reservations", {
        params: { query: { status: status ?? null, page } },
      });
      return data!;
    },
  });
}

export function useCancelAdminReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.POST("/api/v1/admin/reservations/{reservation_id}/cancel", {
        params: { path: { reservation_id: id } },
      });
    },
    onSettled: () => invalidate(qc, "admin", "book", "books"),
  });
}

export function useAdminBookRequests(status?: BookRequestStatus, page = 1) {
  return useQuery({
    queryKey: ["admin", "book-requests", status ?? "all", page],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/admin/book-requests", {
        params: { query: { status: status ?? null, page } },
      });
      return data!;
    },
  });
}

/** Errors: INVALID_STATUS, ALREADY_RESOLVED. */
export function useResolveBookRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { id: number; status: "available" | "rejected"; adminNote?: string }) => {
      const { data } = await api.POST("/api/v1/admin/book-requests/{request_id}/resolve", {
        params: { path: { request_id: v.id } },
        body: { status: v.status, admin_note: v.adminNote || null },
      });
      return data!;
    },
    onSuccess: () => invalidate(qc, "admin"),
  });
}

// ---------------------------------------------------------------- Users

export function useAdminUsers(search: string, page = 1) {
  return useQuery({
    queryKey: ["admin", "users", search, page],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/admin/users", {
        params: { query: { search: search || null, page } },
      });
      return data!;
    },
  });
}

/** Errors: CANNOT_LOCK_SELF. */
export function useSetUserLocked() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, locked }: { id: number; locked: boolean }) => {
      const path = { user_id: id };
      const { data } = locked
        ? await api.POST("/api/v1/admin/users/{user_id}/lock", { params: { path } })
        : await api.POST("/api/v1/admin/users/{user_id}/unlock", { params: { path } });
      return data!;
    },
    onSuccess: () => invalidate(qc, "admin"),
  });
}

// ---------------------------------------------------------------- Reports

export function useRevenue(granularity: Granularity, range: { from?: string; to?: string } = {}) {
  return useQuery({
    queryKey: ["admin", "reports", "revenue", granularity, range],
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/admin/reports/revenue", {
        params: { query: { granularity, from: range.from ?? null, to: range.to ?? null } },
      });
      return data ?? [];
    },
  });
}

export function useSummary() {
  return useQuery({
    queryKey: ["admin", "reports", "summary"],
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/admin/reports/summary");
      return data!;
    },
  });
}

export function useBestSellers(limit = 10) {
  return useQuery({
    queryKey: ["admin", "reports", "best-sellers", limit],
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/admin/reports/best-sellers", {
        params: { query: { limit } },
      });
      return data ?? [];
    },
  });
}

export function useLowStock(threshold = 2) {
  return useQuery({
    queryKey: ["admin", "reports", "low-stock", threshold],
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/admin/reports/low-stock", {
        params: { query: { threshold } },
      });
      return data ?? [];
    },
  });
}
