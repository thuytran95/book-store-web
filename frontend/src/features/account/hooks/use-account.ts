"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { SESSION_KEY, useSession } from "@/lib/session";

export type Address = components["schemas"]["AddressRead"];
export type AddressCreate = components["schemas"]["AddressCreate"];
export type AddressUpdate = components["schemas"]["AddressUpdate"];
export type UserUpdate = components["schemas"]["UserUpdate"];

export const ADDRESSES_KEY = ["addresses"] as const;

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

export function useAddresses(enabled = true) {
  return useQuery({
    queryKey: ADDRESSES_KEY,
    enabled,
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/me/addresses");
      return data ?? [];
    },
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: AddressCreate) => {
      const { data } = await api.POST("/api/v1/me/addresses", { body });
      return data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: number; body: AddressUpdate }) => {
      const { data } = await api.PATCH("/api/v1/me/addresses/{address_id}", {
        params: { path: { address_id: id } },
        body,
      });
      return data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  });
}

/** Errors: DEFAULT_REQUIRED (cannot delete the default while others exist; pick another first). */
export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.DELETE("/api/v1/me/addresses/{address_id}", {
        params: { path: { address_id: id } },
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  });
}

export function useSetDefaultAddress() {
  const update = useUpdateAddress();
  return {
    ...update,
    mutate: (id: number, opts?: Parameters<typeof update.mutate>[1]) =>
      update.mutate({ id, body: { is_default: true } }, opts),
    mutateAsync: (id: number, opts?: Parameters<typeof update.mutateAsync>[1]) =>
      update.mutateAsync({ id, body: { is_default: true } }, opts),
  };
}
