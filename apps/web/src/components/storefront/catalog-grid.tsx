"use client";

import Link from "next/link";
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
      <div className="py-16 text-center">
        <p className="text-sm text-store-muted">
          No products match your search yet.
        </p>
        <Link
          href="/shop"
          className="mt-4 inline-flex bg-store-tint px-5 py-2.5 text-sm font-medium text-store-ink transition-colors hover:bg-brand hover:text-white"
        >
          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4">
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
            className="bg-store-tint px-6 py-2.5 text-sm font-medium text-store-ink transition-colors hover:bg-brand hover:text-white disabled:opacity-50"
          >
            {isPending ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
