"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { SESSION_KEY, useSession } from "@/lib/session";

export type UserUpdate = components["schemas"]["UserUpdate"];

/** Profile shares the `["me"]` cache with the session. */
export function useProfile() {
  const { session, isLoading } = useSession();
  return { data: session?.user ?? null, isLoading };
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UserUpdate) => {
      const { data } = await api.PATCH("/api/v1/me", { body });
      return data!;
    },
    onSuccess: (user) => {
      qc.setQueryData(SESSION_KEY, user);
      return qc.invalidateQueries({ queryKey: SESSION_KEY });
    },
  });
}
