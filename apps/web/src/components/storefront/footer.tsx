import Link from "next/link";

import { getStoreSettings } from "@/lib/catalog/queries";

const SHOP_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Products" },
  { href: "/cart", label: "Cart" },
  { href: "/checkout", label: "Checkout" },
];

export async function StorefrontFooter() {
  const settings = await getStoreSettings();

  const whatsappDigits = settings?.whatsappNumber?.replace(/[^\d]/g, "");

  return (
    <footer className="bg-store-footer text-sm text-white/60">
      <div className="store-container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h3 className="font-heading text-base font-bold text-white">
            Bee Hairplace
          </h3>
          <p className="mt-4 max-w-xs leading-relaxed">
            Human hair wigs, bundles and closures in Abuja, Nigeria. Delivery
            in Abuja or pickup in-store.
          </p>
        </div>

        <div>
          <h3 className="font-heading text-base font-bold text-white">
            Contact us
          </h3>
          <ul className="mt-4 space-y-2">
            {settings?.phone && <li>Phone: {settings.phone}</li>}
            {whatsappDigits && (
              <li>
                <a
                  href={`https://wa.me/${whatsappDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  Chat on WhatsApp
                </a>
              </li>
            )}
            <li>{settings?.address ?? "Abuja, Nigeria"}</li>
            {settings?.openingHours && <li>{settings.openingHours}</li>}
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-base font-bold text-white">
            Useful links
          </h3>
          <ul className="mt-4 space-y-2">
            {SHOP_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="store-container py-5 text-xs text-white/40">
          © {new Date().getFullYear()} Bee Hairplace. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
