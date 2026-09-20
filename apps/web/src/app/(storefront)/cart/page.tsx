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
      <div className="store-container py-16 text-center md:py-24">
        <h1 className="font-heading text-3xl font-bold md:text-4xl">Cart</h1>
        <p className="mt-4 text-store-muted">Your cart is empty.</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          Shop Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="store-container py-8 md:py-12">
      <h1 className="text-center font-heading text-3xl font-bold md:text-4xl">
        Cart
      </h1>

      <div className="mt-8 grid gap-8 md:mt-10 md:grid-cols-[1fr_20rem] md:items-start md:gap-12">
        <div className="divide-y divide-store-line border-y border-store-line">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId ?? "base"}`}
              className="flex gap-4 py-5"
            >
              <Link
                href={`/shop/${item.slug}`}
                className="relative h-28 w-24 shrink-0 overflow-hidden bg-store-tint"
              >
                {item.posterUrl && (
                  <Image
                    src={item.posterUrl}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-cover object-[center_25%]"
                  />
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/shop/${item.slug}`}
                      className="font-heading text-sm font-bold leading-snug text-store-ink hover:text-brand"
                    >
                      {item.name}
                    </Link>
                    {item.variantLabel && (
                      <p className="mt-1 text-xs text-store-muted">
                        {item.variantLabel}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-store-muted">
                      {formatNaira(item.price)} each
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-store-ink">
                    {formatNaira(item.price * item.quantity)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-store-line">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${item.name}`}
                      className="h-9 w-9 text-lg text-store-muted hover:text-store-ink"
                      onClick={() =>
                        setQuantity(
                          item.productId,
                          item.variantId,
                          item.quantity - 1,
                        )
                      }
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${item.name}`}
                      className="h-9 w-9 text-lg text-store-muted hover:text-store-ink"
                      onClick={() =>
                        setQuantity(
                          item.productId,
                          item.variantId,
                          item.quantity + 1,
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-store-muted underline transition-colors hover:text-brand"
                    onClick={() => removeItem(item.productId, item.variantId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border border-store-line p-5">
          <h2 className="font-heading text-lg font-bold">Cart totals</h2>
          <div className="mt-4 flex items-center justify-between border-t border-store-line pt-4">
            <span className="text-sm text-store-muted">Subtotal</span>
            <span className="text-lg font-bold text-store-ink">
              {formatNaira(subtotal)}
            </span>
          </div>
          <p className="mt-2 text-xs text-store-muted">
            Delivery is calculated at checkout.
          </p>
          <Link
            href="/checkout"
            className="mt-5 flex w-full items-center justify-center bg-brand py-3.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
          >
            Proceed to checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
