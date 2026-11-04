"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { SESSION_KEY } from "@/lib/session";

type LoginIn = components["schemas"]["LoginIn"];
type RegisterIn = components["schemas"]["RegisterIn"];
type ResetPasswordIn = components["schemas"]["ResetPasswordIn"];

/** Only allow same-site relative redirects. */
export function safeNext(next: string | null | undefined, fallback = "/"): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

/**
 * Login. Errors: INVALID_CREDENTIALS, ACCOUNT_LOCKED (switch on `ApiError.code`).
 * On success refreshes the session and navigates to `next`.
 */
export function useLogin(next?: string | null) {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (body: LoginIn) => {
      const { data } = await api.POST("/api/v1/auth/login", { body });
      return data!;
    },
    onSuccess: async (user) => {
      qc.setQueryData(SESSION_KEY, user);
      await qc.invalidateQueries();
      router.replace(safeNext(next, user.role === "admin" ? "/admin" : "/"));
      router.refresh();
    },
  });
}

/** Register. Errors: EMAIL_TAKEN, VALIDATION_ERROR. Logs in afterwards via `useLogin` by the caller. */
export function useRegister() {
  return useMutation({
    mutationFn: async (body: RegisterIn) => {
      const payload = { ...body, phone: body.phone || null };
      const { data } = await api.POST("/api/v1/auth/register", { body: payload });
      return data!;
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async () => {
      await api.POST("/api/v1/auth/logout");
    },
    onSettled: () => {
      qc.clear();
      qc.setQueryData(SESSION_KEY, null);
      router.replace("/");
      router.refresh();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      await api.POST("/api/v1/auth/password/forgot", { body: { email } });
    },
  });
}

/** Errors: TOKEN_INVALID. */
export function useResetPassword() {
  return useMutation({
    mutationFn: async (body: ResetPasswordIn) => {
      await api.POST("/api/v1/auth/password/reset", { body });
    },
  });
}
