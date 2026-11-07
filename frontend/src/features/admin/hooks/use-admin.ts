"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

type S = components["schemas"];
export type BookCreate = S["BookCreate"];
export type BookUpdate = S["BookUpdate"];
export type CategoryRead = S["CategoryRead"];
export type AuthorRead = S["AuthorRead"];
export type AuthorRef = S["AuthorRef"];
export type OrderStatus = S["OrderStatus"];

const invalidate = (qc: ReturnType<typeof useQueryClient>, ...keys: string[]) =>
  Promise.all(keys.map((k) => qc.invalidateQueries({ queryKey: [k] })));

// ---------------------------------------------------------------- Books

export type AdminBookFilters = {
  text?: string;
  category?: string;
  author_id?: number;
  condition_min?: number;
  in_stock?: boolean;
  visible?: boolean;
  sort?: S["BookSort"];
  page?: number;
  size?: number;
};

export function useInventoryOverview() {
  return useQuery({
    queryKey: ["admin", "inventory", "overview"],
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/admin/inventory/overview");
      return data!;
    },
  });
}

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
    onSuccess: () =>
      Promise.all([
        invalidate(qc, "admin", "books", "book"),
        qc.invalidateQueries({ queryKey: ["admin", "inventory", "overview"] }),
      ]),
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
    onSuccess: () =>
      Promise.all([
        invalidate(qc, "admin", "books", "book"),
        qc.invalidateQueries({ queryKey: ["admin", "inventory", "overview"] }),
      ]),
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
    onSuccess: () =>
      Promise.all([
        invalidate(qc, "admin", "books", "book"),
        qc.invalidateQueries({ queryKey: ["admin", "inventory", "overview"] }),
      ]),
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

// ---------------------------------------------------------------- Authors

export function useDebouncedValue<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export type AdminAuthorFilters = { q?: string; page?: number; size?: number };

export function useAdminAuthors(filters: AdminAuthorFilters = {}) {
  return useQuery({
    queryKey: ["admin", "authors", filters],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/admin/authors", {
        params: { query: { q: filters.q || null, page: filters.page, size: filters.size } },
      });
      return data!;
    },
  });
}

export function useAdminAuthor(id: number | undefined) {
  return useQuery({
    queryKey: ["admin", "authors", "one", id],
    enabled: id !== undefined && Number.isFinite(id),
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/admin/authors/{author_id}", {
        params: { path: { author_id: id! } },
      });
      return data!;
    },
  });
}

/** Picker search: first 20 matches for a (debounced) query. */
export function useAuthorOptions(q: string, enabled = true) {
  const term = useDebouncedValue(q.trim(), 300);
  return useQuery({
    queryKey: ["admin", "authors", "options", term],
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/admin/authors", {
        params: { query: { q: term || null, size: 20 } },
      });
      return data?.items ?? [];
    },
  });
}

/** Create (no `id`) or update. Errors: AUTHOR_EXISTS. */
export function useSaveAuthor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { id?: number; name: string; bio?: string | null }) => {
      const body = { name: v.name, bio: v.bio || null };
      if (v.id === undefined) {
        const { data } = await api.POST("/api/v1/admin/authors", { body });
        return data!;
      }
      const { data } = await api.PATCH("/api/v1/admin/authors/{author_id}", {
        params: { path: { author_id: v.id } },
        body,
      });
      return data!;
    },
    // A rename changes the books' author text too.
    onSuccess: () => invalidate(qc, "admin", "book"),
  });
}

/** Errors: AUTHOR_IN_USE (retry with `mergeInto`), INVALID_MERGE_TARGET. */
export function useDeleteAuthor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, mergeInto }: { id: number; mergeInto?: number }) => {
      await api.DELETE("/api/v1/admin/authors/{author_id}", {
        params: { path: { author_id: id }, query: { merge_into: mergeInto ?? null } },
      });
    },
    onSuccess: () => invalidate(qc, "admin", "book"),
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
