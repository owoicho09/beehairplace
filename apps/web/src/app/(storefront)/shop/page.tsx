import Link from "next/link";

import { CatalogGrid } from "@/components/storefront/catalog-grid";
import { ShopToolbar } from "@/components/storefront/shop-toolbar";
import {
  getCatalogPage,
  getCategories,
  getCategoryCards,
} from "@/lib/catalog/queries";

export const revalidate = 120;

type ShopSearchParams = {
  category?: string;
  q?: string;
  sort?: "newest" | "price_asc" | "price_desc";
};

function categoryHref(slug: string | null, params: ShopSearchParams) {
  const next = new URLSearchParams();
  if (slug) next.set("category", slug);
  if (params.q) next.set("q", params.q);
  if (params.sort && params.sort !== "newest") next.set("sort", params.sort);
  const qs = next.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const params = await searchParams;
  const filters = {
    categorySlug: params.category,
    q: params.q,
    sort: params.sort,
  };

  const [{ items, nextCursor }, allCategories, stockedCategories] =
    await Promise.all([
      getCatalogPage(filters),
      getCategories(),
      getCategoryCards(),
    ]);

  const activeCategory = allCategories.find((c) => c.slug === params.category);
  // Only offer categories that actually have products (a chip that lands on an
  // empty page looks broken), but always keep the one currently selected.
  const stockedSlugs = new Set(stockedCategories.map((c) => c.slug));
  const categories = allCategories.filter(
    (c) => stockedSlugs.has(c.slug) || c.slug === params.category,
  );

  return (
    <div className="store-container py-8 md:py-12">
      <h1 className="text-center font-heading text-3xl font-bold md:text-4xl">
        {activeCategory?.name ?? "Shop"}
      </h1>

      {categories.length > 0 && (
        <nav
          aria-label="Categories"
          className="scrollbar-none mt-6 flex gap-2 overflow-x-auto md:justify-center"
        >
          {[{ slug: null, name: "All" }, ...categories].map((category) => {
            const active = (category.slug ?? undefined) === params.category;
            return (
              <Link
                key={category.slug ?? "all"}
                href={categoryHref(category.slug, params)}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 whitespace-nowrap border px-4 py-2 text-sm transition-colors ${
                  active
                    ? "border-brand bg-brand text-white"
                    : "border-store-line text-store-ink hover:border-brand hover:text-brand"
                }`}
              >
                {category.name}
              </Link>
            );
          })}
        </nav>
      )}

      <div className="mt-6">
        <ShopToolbar />
      </div>

      <div className="mt-8">
        <CatalogGrid
          // Remount on filter change: CatalogGrid seeds its item list from
          // props via useState, which only runs on mount. Without a key
          // tied to the filters, a client-side navigation to a new filter
          // combination leaves the old list on screen even though the
          // server already computed fresh, correctly filtered results.
          key={`${filters.categorySlug ?? ""}|${filters.q ?? ""}|${filters.sort ?? ""}`}
          initialItems={items}
          initialCursor={nextCursor}
          filters={filters}
        />
      </div>
    </div>
  );
}
