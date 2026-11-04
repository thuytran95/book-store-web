"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "./api/client";
import type { components } from "./api/schema";

export type User = components["schemas"]["UserRead"];
export type Session = { user: User; role: User["role"] };

export const SESSION_KEY = ["me"] as const;

/** Client hook: `{ user, role }` or null when logged out. Shares the `["me"]` cache. */
export function useSession() {
  const query = useQuery({
    queryKey: SESSION_KEY,
    queryFn: async (): Promise<User | null> => {
      try {
        const { data } = await api.GET("/api/v1/me");
        return data ?? null;
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60_000,
    retry: false,
  });
  const user = query.data ?? null;
  const session: Session | null = user ? { user, role: user.role } : null;
  return { session, isLoading: query.isLoading };
}
