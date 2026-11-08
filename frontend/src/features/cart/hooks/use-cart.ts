"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { hasCode } from "@/lib/api/errors";
import type { components } from "@/lib/api/schema";
import { useSession } from "@/lib/session";
import { toast } from "@/lib/toast";

export type Cart = components["schemas"]["CartRead"];
export const CART_KEY = ["cart"] as const;
const EMPTY: Cart = { items: [], total: 0 };

function withQty(cart: Cart, bookId: number, qty: number): Cart {
  const items = cart.items
    .map((i) =>
      i.book.id === bookId
        ? { ...i, quantity: qty, line_total: i.book.price * qty }
        : i,
    )
    .filter((i) => i.quantity > 0);
  return { items, total: items.reduce((s, i) => s + i.line_total, 0) };
}

function stockMessage(e: unknown): string | null {
  if (hasCode(e, "OUT_OF_STOCK")) return "Sách không đủ số lượng trong kho.";
  if (hasCode(e, "BOOK_UNAVAILABLE")) return "Sách này hiện không còn bán.";
  return null;
}

/** Shared optimistic mutation: apply `patch` to the cached cart, roll back on error. */
function useCartMutation<V>(
  mutationFn: (v: V) => Promise<unknown>,
  patch: (cart: Cart, v: V) => Cart,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onMutate: async (v: V) => {
      await qc.cancelQueries({ queryKey: CART_KEY });
      const previous = qc.getQueryData<Cart>(CART_KEY);
      qc.setQueryData<Cart>(CART_KEY, (c) => patch(c ?? EMPTY, v));
      return { previous };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(CART_KEY, ctx.previous);
      const msg = stockMessage(e);
      if (msg) toast.error(msg);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: CART_KEY }),
  });
}

/** Cart for the signed-in user. Guests get an empty cart and no request. */
export function useCart() {
  const { session, isLoading: sessionLoading } = useSession();
  const query = useQuery({
    queryKey: CART_KEY,
    enabled: Boolean(session),
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/cart");
      return data ?? EMPTY;
    },
  });

  const setQtyM = useCartMutation(
    async ({ bookId, quantity }: { bookId: number; quantity: number }) => {
      await api.PUT("/api/v1/cart/items/{book_id}", {
        params: { path: { book_id: bookId } },
        body: { quantity },
      });
    },
    (c, v) => withQty(c, v.bookId, v.quantity),
  );

  const removeM = useCartMutation(
    async (bookId: number) => {
      await api.DELETE("/api/v1/cart/items/{book_id}", { params: { path: { book_id: bookId } } });
    },
    (c, id) => withQty(c, id, 0),
  );

  const clearM = useCartMutation(
    async () => {
      await api.DELETE("/api/v1/cart");
    },
    () => EMPTY,
  );

  const cart = query.data ?? EMPTY;
  return {
    items: cart.items,
    total: cart.total,
    count: cart.items.reduce((s, i) => s + i.quantity, 0),
    setQty: (bookId: number, quantity: number) => setQtyM.mutate({ bookId, quantity }),
    remove: (bookId: number) => removeM.mutate(bookId),
    clear: () => clearM.mutate(),
    isLoading: sessionLoading || (Boolean(session) && query.isLoading),
    isMutating: setQtyM.isPending || removeM.isPending || clearM.isPending,
  };
}

/** Header badge: guests see 0. */
export function useCartCount() {
  return useCart().count;
}

/**
 * Add to cart from book cards/detail. Guests are redirected to login.
 * `quantity` is the amount to add on top of what is already in the cart.
 */
export function useAddToCart() {
  const router = useRouter();
  const qc = useQueryClient();
  const { session } = useSession();

  return useMutation({
    // Run add-to-cart calls one after another (across every button on the page), so each
    // read-then-PUT sees the result of the previous one instead of the same stale quantity.
    scope: { id: "cart-add" },
    mutationFn: async ({ bookId, quantity = 1 }: { bookId: number; quantity?: number }) => {
      // The PUT sets an absolute quantity, so read the current cart from the server,
      // not from the (possibly stale) query cache.
      await qc.cancelQueries({ queryKey: CART_KEY });
      const { data: current } = await api.GET("/api/v1/cart");
      const existing = current?.items.find((i) => i.book.id === bookId)?.quantity ?? 0;
      const { data } = await api.PUT("/api/v1/cart/items/{book_id}", {
        params: { path: { book_id: bookId } },
        body: { quantity: existing + quantity },
      });
      // Update the header badge right away from the server response.
      if (data) qc.setQueryData<Cart>(CART_KEY, data);
      return data;
    },
    onMutate: () => {
      if (!session) {
        const next = window.location.pathname + window.location.search;
        router.push(`/login?next=${encodeURIComponent(next)}`);
        throw new Error("login-required");
      }
    },
    onSuccess: () => {
      toast.success("Đã thêm vào giỏ hàng");
    },
    onError: (e) => {
      const msg = stockMessage(e);
      if (msg) toast.error(msg);
      qc.invalidateQueries({ queryKey: CART_KEY });
    },
  });
}
