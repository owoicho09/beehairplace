import { CatalogGrid } from "@/components/storefront/catalog-grid";
import { FilterSheet } from "@/components/storefront/filter-sheet";
import { SearchBar } from "@/components/storefront/search-bar";
import { getCatalogPage, getCategories } from "@/lib/catalog/queries";

export const revalidate = 120;

type ShopSearchParams = {
  category?: string;
  q?: string;
  sort?: "newest" | "price_asc" | "price_desc";
};

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

  const [{ items, nextCursor }, categories] = await Promise.all([
    getCatalogPage(filters),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex items-center gap-2">
        <SearchBar />
        <FilterSheet categories={categories} />
      </div>
      <div className="mt-6">
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
