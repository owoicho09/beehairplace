import Link from "next/link";

import { getAdminProducts, type AdminProductFilter } from "@/lib/admin/products/queries";
import { formatNaira } from "@/lib/utils";

const FILTERS: { value: AdminProductFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: AdminProductFilter; q?: string }>;
}) {
  const params = await searchParams;
  const filter = params.filter ?? "all";
  const products = await getAdminProducts({ filter, q: params.q });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-editorial text-2xl">Products</h1>
        <Link href="/admin/products/new" className="bg-ink px-4 py-2 text-sm text-ivory">
          New product
        </Link>
      </div>

      <div className="mt-4 flex gap-1 text-sm">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/admin/products?filter=${f.value}`}
            className={`rounded-full px-3 py-1.5 ${
              filter === f.value ? "bg-ink text-ivory" : "text-ink-soft hover:bg-ivory"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="mt-4 divide-y divide-line border-y border-line">
        {products.length === 0 && (
          <p className="py-6 text-sm text-ink-soft">No products here yet.</p>
        )}
        {products.map((product) => {
          const primaryMedia = product.media[0];
          return (
            <Link
              key={product.id}
              href={`/admin/products/${product.id}/edit`}
              className="flex items-center gap-3 py-3"
            >
              <div className="h-14 w-11 shrink-0 overflow-hidden bg-warm-grey-light">
                {primaryMedia?.posterUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={primaryMedia.posterUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-ink">{product.name}</p>
                <p className="text-xs text-ink-soft">
                  {product.category?.name ?? "Uncategorized"} ·{" "}
                  {product.hasVariants ? "Variable price" : formatNaira(Number(product.basePrice ?? 0))}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs">
                <span
                  className={`rounded-full px-2 py-0.5 ${
                    product.publishStatus === "published"
                      ? "bg-ivory-dim text-ink"
                      : "bg-warm-grey-light text-ink-soft"
                  }`}
                >
                  {product.publishStatus}
                </span>
                {primaryMedia && primaryMedia.status !== "ready" && (
                  <span className="text-burgundy capitalize">{primaryMedia.status}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
