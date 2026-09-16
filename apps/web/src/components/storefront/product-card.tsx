import Image from "next/image";
import Link from "next/link";

import { formatNaira } from "@/lib/utils";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  startingPrice: number;
  hasVariants: boolean;
  posterUrl: string | null;
  hasVideo: boolean;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-warm-grey-light">
        {product.posterUrl ? (
          <Image
            src={product.posterUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-warm-grey text-xs">
            No image
          </div>
        )}
        {product.hasVideo && (
          <span
            aria-label="Has video"
            className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink/60 backdrop-blur-sm"
          >
            <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 fill-ivory">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        )}
      </div>
      <div className="mt-1.5 space-y-0.5">
        <p className="truncate text-[13px] leading-tight text-ink">
          {product.name}
        </p>
        <p className="text-[13px] leading-tight text-ink-soft">
          {product.hasVariants && "From "}
          {formatNaira(product.startingPrice)}
        </p>
      </div>
    </Link>
  );
}
