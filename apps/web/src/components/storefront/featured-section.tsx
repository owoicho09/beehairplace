import Image from "next/image";
import Link from "next/link";

import { InViewVideo } from "./inview-video";
import { formatNaira } from "@/lib/utils";

export type FeaturedProduct = {
  slug: string;
  name: string;
  startingPrice: number;
  hasVariants: boolean;
  posterUrl: string | null;
  videoUrl: string | null;
};

export function FeaturedSection({
  title,
  products,
  viewAllHref,
}: {
  title: string;
  products: FeaturedProduct[];
  viewAllHref?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-baseline justify-between">
        <h2 className="font-editorial text-2xl">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm text-ink-soft underline underline-offset-4 transition-colors hover:text-ink"
          >
            View all
          </Link>
        )}
      </div>
      {/* Mobile: horizontal swipeable row, same pattern as the related-products
          carousel on the product detail page. Desktop: fixed 3-column grid. */}
      <div className="scrollbar-none mt-5 flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:pb-0">
        {products.map((product) => (
          <Link
            key={product.slug}
            href={`/shop/${product.slug}`}
            className="group block w-32 shrink-0 sm:w-full"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-warm-grey-light">
              {product.videoUrl ? (
                <InViewVideo
                  src={product.videoUrl}
                  poster={product.posterUrl}
                  className="h-full w-full object-cover"
                />
              ) : product.posterUrl ? (
                <Image
                  src={product.posterUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 128px, 33vw"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="mt-1.5">
              <p className="truncate text-[13px] text-ink">{product.name}</p>
              <p className="text-[13px] text-ink-soft">
                {product.hasVariants && "From "}
                {formatNaira(product.startingPrice)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
