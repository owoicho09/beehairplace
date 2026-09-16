"use client";

import { useState } from "react";

import { setBestSeller, setFeatured } from "@/lib/admin/homepage/actions";

export type MerchandisableProduct = {
  id: string;
  name: string;
  isFeatured: boolean;
  isBestSeller: boolean;
};

export function MerchandisingPicker({ products }: { products: MerchandisableProduct[] }) {
  const [rows, setRows] = useState(products);
  const [error, setError] = useState<string | null>(null);

  const featuredCount = rows.filter((r) => r.isFeatured).length;

  return (
    <div>
      {error && <p className="mb-2 text-sm text-burgundy">{error}</p>}
      <p className="text-xs text-ink-soft">Featured: {featuredCount}/3</p>
      <div className="mt-2 divide-y divide-line border-y border-line">
        {rows.map((product) => (
          <div key={product.id} className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-ink">{product.name}</span>
            <div className="flex gap-4 text-xs text-ink-soft">
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={product.isFeatured}
                  onChange={async (e) => {
                    const result = await setFeatured(product.id, e.target.checked);
                    if (!result.ok) {
                      setError(result.error);
                      return;
                    }
                    setError(null);
                    setRows((prev) =>
                      prev.map((r) => (r.id === product.id ? { ...r, isFeatured: e.target.checked } : r)),
                    );
                  }}
                />
                Featured
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={product.isBestSeller}
                  onChange={async (e) => {
                    await setBestSeller(product.id, e.target.checked);
                    setRows((prev) =>
                      prev.map((r) =>
                        r.id === product.id ? { ...r, isBestSeller: e.target.checked } : r,
                      ),
                    );
                  }}
                />
                Best seller
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
