import createClient from "openapi-fetch";
import type { paths } from "./schema";
import { parseApiError } from "./errors";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
/** Server Components / RSC fetch (Docker: use service hostname, not localhost). */
export const SERVER_API_URL = process.env.API_INTERNAL_URL ?? API_URL;

const AUTH_SKIP_REFRESH = [
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/refresh",
  "/api/v1/auth/password/",
];
/** 401 here means "not logged in", not "session expired": never redirect. */
const AUTH_NO_REDIRECT = ["/api/v1/me"];

let refreshing: Promise<boolean> | null = null;

function refreshOnce(): Promise<boolean> {
  refreshing ??= fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

function redirectToLogin() {
  if (typeof window === "undefined") return;
  const next = window.location.pathname + window.location.search;
  window.location.assign(`/login?next=${encodeURIComponent(next)}`);
}

/**
 * fetch wrapper: error envelope -> ApiError, 401 -> refresh once -> retry,
 * else redirect to login (browser only).
 */
export function browserFetch(input: Request): Promise<Response> {
  return (async () => {
    const retry = input.clone();
    let res = await fetch(input);
    if (res.status === 401 && typeof window !== "undefined") {
      const path = new URL(input.url).pathname;
      if (!AUTH_SKIP_REFRESH.some((p) => path.startsWith(p))) {
        if (await refreshOnce()) {
          res = await fetch(retry);
        }
        if (res.status === 401 && !AUTH_NO_REDIRECT.includes(path)) {
          redirectToLogin();
        }
      }
    }
    if (!res.ok) throw await parseApiError(res);
    return res;
  })();
}

export function createApi(
  fetchImpl: (r: Request) => Promise<Response>,
  baseUrl: string = API_URL,
) {
  return createClient<paths>({
    baseUrl,
    credentials: "include",
    fetch: fetchImpl,
  });
}

/** Typed client for the browser / Client Components. */
export const api = createApi(browserFetch);

export type { paths };
