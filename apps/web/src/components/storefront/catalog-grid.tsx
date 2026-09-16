"use client";

import { useState, useTransition } from "react";

import { loadMoreProducts } from "@/lib/catalog/actions";

import { ProductCard, type ProductCardData } from "./product-card";

export function CatalogGrid({
  initialItems,
  initialCursor,
  filters,
}: {
  initialItems: ProductCardData[];
  initialCursor: string | null;
  filters: { categorySlug?: string; q?: string; sort?: "newest" | "price_asc" | "price_desc" };
}) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [isPending, startTransition] = useTransition();

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-ink-soft">
        No hairs match your search yet.
      </p>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-x-2 gap-y-5 sm:grid-cols-4 lg:grid-cols-5">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {cursor && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const next = await loadMoreProducts({ ...filters, cursor: cursor ?? undefined });
                setItems((prev) => [...prev, ...next.items]);
                setCursor(next.nextCursor);
              });
            }}
            className="border border-line px-6 py-2.5 text-sm text-ink transition-colors hover:border-ink disabled:opacity-50"
          >
            {isPending ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
