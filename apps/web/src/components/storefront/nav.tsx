"use client";

import Link from "next/link";

import { useCartStore } from "@/lib/cart/store";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";

export function StorefrontNav() {
  const items = useCartStore((s) => s.items);
  // Avoid hydration mismatch: cart count comes from localStorage, which
  // isn't available during server render.
  const mounted = useHasMounted();
  const count = mounted ? items.reduce((sum, i) => sum + i.quantity, 0) : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ivory/95 backdrop-blur-sm">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-editorial text-lg tracking-tight">
          Bee Hairplace
        </Link>
        <div className="flex items-center gap-5 text-sm">
          <Link href="/shop" className="hidden sm:inline">
            Shop
          </Link>
          <Link href="/cart" className="relative" aria-label="Cart">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 stroke-ink fill-none"
              strokeWidth={1.5}
            >
              <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-burgundy px-1 text-[10px] text-ivory">
                {count}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}
