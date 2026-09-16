"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

export function FilterSheet({
  categories,
}: {
  categories: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const activeCategory = searchParams.get("category") ?? "";
  const activeSort = searchParams.get("sort") ?? "newest";

  function applyFilters(next: { category?: string; sort?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    const category = next.category ?? activeCategory;
    const sort = next.sort ?? activeSort;

    if (category) params.set("category", category);
    else params.delete("category");

    if (sort && sort !== "newest") params.set("sort", sort);
    else params.delete("sort");

    router.push(`/shop?${params.toString()}`);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 border border-line px-4 py-2 text-sm text-ink"
      >
        Filter
        {(activeCategory || activeSort !== "newest") && (
          <span className="h-1.5 w-1.5 rounded-full bg-burgundy" />
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
          <button
            aria-label="Close filters"
            className="absolute inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-t-2xl bg-ivory p-5 sm:rounded-2xl">
            <h3 className="font-editorial text-lg">Filter & sort</h3>

            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-warm-grey">
              Category
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyFilters({ category: "" })}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  activeCategory === "" ? "border-ink bg-ink text-ivory" : "border-line"
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => applyFilters({ category: c.slug })}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    activeCategory === c.slug
                      ? "border-ink bg-ink text-ivory"
                      : "border-line"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <p className="mt-5 text-xs font-medium uppercase tracking-wide text-warm-grey">
              Sort by
            </p>
            <div className="mt-2 flex flex-col gap-1">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => applyFilters({ sort: option.value })}
                  className={`rounded px-2 py-2 text-left text-sm ${
                    activeSort === option.value ? "bg-ivory-dim text-ink" : "text-ink-soft"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 w-full bg-ink py-3 text-sm text-ivory"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
