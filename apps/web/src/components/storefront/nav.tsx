"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useCartStore } from "@/lib/cart/store";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";

const NAV_LINKS = [
  { href: "/", label: "Home", isActive: (path: string) => path === "/" },
  {
    href: "/shop",
    label: "Products",
    isActive: (path: string) => path.startsWith("/shop"),
  },
];

export function StorefrontNav() {
  const items = useCartStore((s) => s.items);
  // Avoid hydration mismatch: cart count comes from localStorage, which
  // isn't available during server render.
  const mounted = useHasMounted();
  const count = mounted ? items.reduce((sum, i) => sum + i.quantity, 0) : 0;

  const pathname = usePathname();
  // The menu is "open" only for the path it was opened on, so navigating
  // anywhere closes it without needing an effect to reset state.
  const [openOnPath, setOpenOnPath] = useState<string | null>(null);
  const menuOpen = openOnPath === pathname;

  return (
    <header className="sticky top-0 z-40 border-b border-store-line bg-white">
      <nav className="store-container flex h-14 items-center md:h-16">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/bee-hairplace-logo.jpg"
            alt="Bee Hairplace"
            width={48}
            height={48}
            priority
            className="h-10 w-10 md:h-12 md:w-12"
          />
        </Link>

        <div className="ml-10 hidden items-stretch gap-8 self-stretch md:flex">
          {NAV_LINKS.map((link) => {
            const active = link.isActive(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center text-sm font-medium transition-colors hover:text-brand ${
                  active ? "text-brand" : "text-store-ink"
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-4">
          <Link
            href="/cart"
            className="relative flex h-9 w-9 items-center justify-center"
            aria-label={count > 0 ? `Cart, ${count} items` : "Cart"}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-none stroke-store-ink"
              strokeWidth={1.6}
            >
              <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
            </svg>
            {count > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-medium leading-none text-white">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setOpenOnPath(menuOpen ? null : pathname)}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-none stroke-store-ink"
              strokeWidth={1.6}
              strokeLinecap="round"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M18 6 6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-store-line bg-white md:hidden">
          <div className="store-container flex flex-col py-2">
            {NAV_LINKS.map((link) => {
              const active = link.isActive(pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`py-3 text-sm font-medium ${
                    active ? "text-brand" : "text-store-ink"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link href="/cart" className="py-3 text-sm font-medium text-store-ink">
              Cart{count > 0 ? ` (${count})` : ""}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
