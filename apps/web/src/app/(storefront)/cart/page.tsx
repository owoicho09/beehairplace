"use client";

import Image from "next/image";
import Link from "next/link";

import { useCartStore } from "@/lib/cart/store";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";
import { formatNaira } from "@/lib/utils";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const mounted = useHasMounted();

  if (!mounted) return null;

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-ink-soft">Your bag is empty.</p>
        <Link
          href="/shop"
          className="mt-4 inline-flex bg-ink px-6 py-3 text-sm text-ivory"
        >
          Shop the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-editorial text-2xl">Your bag</h1>

      <div className="mt-6 divide-y divide-line">
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.variantId ?? "base"}`}
            className="flex gap-4 py-4"
          >
            <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-warm-grey-light">
              {item.posterUrl && (
                <Image
                  src={item.posterUrl}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <Link href={`/shop/${item.slug}`} className="text-sm text-ink">
                  {item.name}
                </Link>
                {item.variantLabel && (
                  <p className="text-xs text-ink-soft">{item.variantLabel}</p>
                )}
                <p className="mt-1 text-sm text-ink-soft">
                  {formatNaira(item.price)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-line">
                  <button
                    type="button"
                    className="px-2.5 py-1 text-sm"
                    onClick={() =>
                      setQuantity(item.productId, item.variantId, item.quantity - 1)
                    }
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button
                    type="button"
                    className="px-2.5 py-1 text-sm"
                    onClick={() =>
                      setQuantity(item.productId, item.variantId, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="text-xs text-warm-grey underline"
                  onClick={() => removeItem(item.productId, item.variantId)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
        <span className="text-sm text-ink-soft">Subtotal</span>
        <span className="text-lg text-ink">{formatNaira(subtotal)}</span>
      </div>

      <Link
        href="/checkout"
        className="mt-6 flex w-full items-center justify-center bg-ink py-3.5 text-sm font-medium text-ivory transition-colors hover:bg-ink-soft"
      >
        Proceed to checkout
      </Link>
    </div>
  );
}
