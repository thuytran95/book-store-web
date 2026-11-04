"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { useSession } from "@/lib/session";

export type BookRequest = components["schemas"]["BookRequestRead"];
export type BookRequestCreate = components["schemas"]["BookRequestCreate"];

export function useBookRequests() {
  const { session } = useSession();
  return useQuery({
    queryKey: ["book-requests"],
    enabled: Boolean(session),
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/book-requests");
      return data ?? [];
    },
  });
}

export function useCreateBookRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: BookRequestCreate) => {
      const { data } = await api.POST("/api/v1/book-requests", {
        body: { title: body.title, author: body.author || null, note: body.note || null },
      });
      return data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["book-requests"] }),
  });
}
