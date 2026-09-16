"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  variantId: string | null;
  quantity: number;
  // Display-only snapshot captured at add-to-cart time; checkout always
  // re-prices against the live database, never trusts these fields.
  name: string;
  variantLabel: string | null;
  price: number;
  posterUrl: string | null;
  slug: string;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  setQuantity: (
    productId: string,
    variantId: string | null,
    quantity: number,
  ) => void;
  clear: () => void;
};

function sameLine(
  a: { productId: string; variantId: string | null },
  b: { productId: string; variantId: string | null },
) {
  return a.productId === b.productId && a.variantId === b.variantId;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, item));
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, item)
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !sameLine(i, { productId, variantId }),
          ),
        })),
      setQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              sameLine(i, { productId, variantId }) ? { ...i, quantity } : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "bhp-cart" },
  ),
);
