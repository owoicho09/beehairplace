import Link from "next/link";
import Image from "next/image";

import { formatNaira } from "@/lib/utils";
import type { ProductCardData } from "./product-card";

export function RelatedCarousel({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="font-editorial text-xl">You may also like</h2>
      <div className="scrollbar-none mt-4 flex gap-3 overflow-x-auto pb-2">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/shop/${product.slug}`}
            className="w-32 shrink-0 sm:w-40"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-warm-grey-light">
              {product.posterUrl && (
                <Image
                  src={product.posterUrl}
                  alt={product.name}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              )}
            </div>
            <p className="mt-1.5 truncate text-[13px] text-ink">{product.name}</p>
            <p className="text-[13px] text-ink-soft">
              {product.hasVariants && "From "}
              {formatNaira(product.startingPrice)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
