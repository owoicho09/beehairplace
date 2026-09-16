"use client";

import { useRouter } from "next/navigation";

import { archiveProduct, duplicateProduct } from "@/lib/admin/products/actions";

export function ProductActions({ productId }: { productId: string }) {
  const router = useRouter();

  return (
    <div className="flex gap-3 text-xs">
      <button
        type="button"
        onClick={() => duplicateProduct(productId)}
        className="text-ink-soft underline"
      >
        Duplicate
      </button>
      <button
        type="button"
        onClick={() => {
          if (confirm("Archive this product? It will be hidden from the storefront.")) {
            archiveProduct(productId).then(() => router.push("/admin/products"));
          }
        }}
        className="text-burgundy underline"
      >
        Archive
      </button>
    </div>
  );
}
