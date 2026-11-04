import { cache } from "react";
import { serverApi } from "./api/server";
import type { Session } from "./session";

/** Session for Server Components (calls `/me` with the request cookies). Null if logged out. */
export const getSession = cache(async (): Promise<Session | null> => {
  try {
    const api = await serverApi();
    const { data } = await api.GET("/api/v1/me");
    return data ? { user: data, role: data.role } : null;
  } catch {
    return null;
  }
});
