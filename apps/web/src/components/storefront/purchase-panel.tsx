"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useCartStore } from "@/lib/cart/store";
import { formatNaira } from "@/lib/utils";

export type PurchaseVariant = {
  id: string;
  label: string;
  price: number;
  availability: "in_stock" | "out_of_stock";
};

export function PurchasePanel({
  productId,
  slug,
  name,
  posterUrl,
  basePrice,
  availability,
  variants,
}: {
  productId: string;
  slug: string;
  name: string;
  posterUrl: string | null;
  basePrice: number | null;
  availability: "in_stock" | "out_of_stock";
  variants: PurchaseVariant[];
}) {
  const hasVariants = variants.length > 0;
  const [variantId, setVariantId] = useState<string | null>(
    hasVariants ? variants[0].id : null,
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1500);
    return () => clearTimeout(timer);
  }, [added]);

  const selectedVariant = hasVariants
    ? variants.find((v) => v.id === variantId)
    : null;
  const price = hasVariants ? (selectedVariant?.price ?? 0) : (basePrice ?? 0);
  const inStock = hasVariants
    ? selectedVariant?.availability === "in_stock"
    : availability === "in_stock";

  function buildCartItem() {
    return {
      productId,
      variantId,
      quantity,
      name,
      variantLabel: selectedVariant?.label ?? null,
      price,
      posterUrl,
      slug,
    };
  }

  return (
    <div>
      <p className="text-xl font-bold text-store-ink">{formatNaira(price)}</p>

      {hasVariants && (
        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-store-muted">
            Length
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                disabled={variant.availability === "out_of_stock"}
                onClick={() => setVariantId(variant.id)}
                aria-pressed={variantId === variant.id}
                className={`border px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  variantId === variant.id
                    ? "border-brand bg-brand text-white"
                    : "border-store-line text-store-ink hover:border-brand"
                }`}
              >
                {variant.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 border-y border-store-line py-5">
        {!inStock ? (
          <p className="text-sm text-store-muted">Currently out of stock.</p>
        ) : (
          <>
            <div className="flex gap-3">
              <div className="flex items-center border border-store-line">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  className="h-11 w-9 text-lg text-store-muted hover:text-store-ink disabled:opacity-40"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="w-8 text-center text-sm" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  className="h-11 w-9 text-lg text-store-muted hover:text-store-ink"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  addItem(buildCartItem());
                  setAdded(true);
                }}
                className="h-11 flex-1 bg-brand-soft px-4 text-sm font-medium text-store-ink transition-colors hover:bg-brand hover:text-white"
              >
                {added ? "Added ✓" : "Add to cart"}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                addItem(buildCartItem());
                router.push("/checkout");
              }}
              className="mt-3 h-11 w-full bg-store-ink text-sm font-medium text-white transition-colors hover:bg-brand"
            >
              Buy now
            </button>
          </>
        )}
      </div>
    </div>
  );
}
