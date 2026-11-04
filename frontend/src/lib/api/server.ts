import { cookies } from "next/headers";
import { createApi, SERVER_API_URL } from "./client";
import { parseApiError } from "./errors";

/**
 * Typed client for Server Components / route handlers.
 * Forwards the incoming request cookies to the API. No refresh (cannot set cookies here).
 */
export async function serverApi() {
  const cookie = (await cookies()).toString();
  return createApi(async (req) => {
    if (cookie) req.headers.set("cookie", cookie);
    const res = await fetch(req, { cache: "no-store" });
    if (!res.ok) throw await parseApiError(res);
    return res;
  }, SERVER_API_URL);
}

/** Like serverApi but without cookies and cacheable, for public catalog pages. */
export function publicApi(revalidate = 60) {
  return createApi(async (req) => {
    const res = await fetch(req, { next: { revalidate } });
    if (!res.ok) throw await parseApiError(res);
    return res;
  }, SERVER_API_URL);
}
