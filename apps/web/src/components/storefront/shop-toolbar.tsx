"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

/** Search box + sort dropdown for /shop. Both write to the URL, which the
 *  server page reads, so filters always reflect what's in the address bar. */
export function ShopToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const activeSort = searchParams.get("sort") ?? "newest";

  function update(changes: { q?: string; sort?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (changes.q !== undefined) {
      if (changes.q.trim()) params.set("q", changes.q.trim());
      else params.delete("q");
    }
    if (changes.sort !== undefined) {
      if (changes.sort && changes.sort !== "newest") params.set("sort", changes.sort);
      else params.delete("sort");
    }
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          update({ q: query });
        }}
        className="flex-1"
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          className="w-full border border-store-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
      </form>
      <select
        value={activeSort}
        onChange={(e) => update({ sort: e.target.value })}
        aria-label="Sort products"
        className="border border-store-line bg-white px-3 py-2.5 text-sm text-store-ink outline-none focus:border-brand"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
