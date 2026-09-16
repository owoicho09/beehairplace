"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const selectedVariant = hasVariants
    ? variants.find((v) => v.id === variantId)
    : null;
  const price = hasVariants ? (selectedVariant?.price ?? 0) : (basePrice ?? 0);
  const inStock = hasVariants
    ? selectedVariant?.availability === "in_stock"
    : availability === "in_stock";

  function buildCartItem(quantity: number) {
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
      <p className="text-xl text-ink">{formatNaira(price)}</p>

      {hasVariants && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-warm-grey">
            Length
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                disabled={variant.availability === "out_of_stock"}
                onClick={() => setVariantId(variant.id)}
                className={`rounded-full border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 ${
                  variantId === variant.id
                    ? "border-ink bg-ink text-ivory"
                    : "border-line text-ink"
                }`}
              >
                {variant.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {!inStock ? (
        <p className="mt-6 text-sm text-ink-soft">Currently out of stock.</p>
      ) : (
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => {
              addItem(buildCartItem(1));
              router.push("/checkout");
            }}
            className="flex-1 bg-ink py-3 text-sm font-medium text-ivory transition-colors hover:bg-ink-soft"
          >
            Buy now
          </button>
          <button
            type="button"
            onClick={() => addItem(buildCartItem(1))}
            className="flex-1 border border-ink py-3 text-sm font-medium text-ink transition-colors hover:bg-ivory-dim"
          >
            Add to bag
          </button>
        </div>
      )}
    </div>
  );
}
