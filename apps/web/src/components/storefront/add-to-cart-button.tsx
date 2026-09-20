"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useCartStore } from "@/lib/cart/store";

import type { ProductCardData } from "./product-card";

const BUTTON_CLASS =
  "mt-auto inline-flex w-full max-w-[9.5rem] items-center justify-center bg-brand-soft px-3 py-2 text-xs font-medium text-store-ink transition-colors hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-brand-soft disabled:hover:text-store-ink";

/**
 * Card-level Add to cart. Products with variants (lengths) can't be added
 * without choosing one, so they link to the product page instead.
 */
export function AddToCartButton({ product }: { product: ProductCardData }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1500);
    return () => clearTimeout(timer);
  }, [added]);

  if (product.hasVariants) {
    return (
      <Link href={`/shop/${product.slug}`} className={BUTTON_CLASS}>
        Select options
      </Link>
    );
  }

  if (product.availability === "out_of_stock") {
    return (
      <button type="button" disabled className={BUTTON_CLASS}>
        Out of stock
      </button>
    );
  }

  return (
    <button
      type="button"
      className={BUTTON_CLASS}
      onClick={() => {
        addItem({
          productId: product.id,
          variantId: null,
          quantity: 1,
          name: product.name,
          variantLabel: null,
          price: product.startingPrice,
          posterUrl: product.posterUrl,
          slug: product.slug,
        });
        setAdded(true);
      }}
    >
      {added ? "Added ✓" : "Add to cart"}
    </button>
  );
}
