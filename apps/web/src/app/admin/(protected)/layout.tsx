import Link from "next/link";

import { requireAdmin } from "@/lib/auth/dal";
import { logout } from "@/lib/auth/actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/delivery", label: "Delivery" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-ivory-dim">
      <header className="border-b border-line bg-ivory px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="font-editorial text-lg">Bee Hairplace admin</span>
          <form action={logout}>
            <button type="submit" className="text-xs text-warm-grey underline">
              Sign out ({session.email})
            </button>
          </form>
        </div>
        <nav className="scrollbar-none mt-3 flex gap-1 overflow-x-auto text-sm">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full px-3 py-1.5 text-ink-soft hover:bg-ivory-dim hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}
