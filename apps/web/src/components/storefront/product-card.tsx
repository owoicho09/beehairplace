import Image from "next/image";
import Link from "next/link";

import { formatNaira } from "@/lib/utils";

import { AddToCartButton } from "./add-to-cart-button";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  startingPrice: number;
  hasVariants: boolean;
  availability: "in_stock" | "out_of_stock";
  posterUrl: string | null;
  hasVideo: boolean;
};

export function ProductCard({
  product,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 270px",
  priority = false,
}: {
  product: ProductCardData;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <Link href={`/shop/${product.slug}`} className="group block w-full">
        <div className="relative aspect-square w-full overflow-hidden bg-store-tint">
          {product.posterUrl ? (
            <Image
              src={product.posterUrl}
              alt={product.name}
              fill
              sizes={sizes}
              priority={priority}
              className="object-cover object-[center_25%]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-store-muted">
              No image
            </div>
          )}
        </div>
        <h3 className="mt-3 line-clamp-2 h-10 font-heading text-sm font-bold leading-5 text-store-ink">
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-store-ink">
          {product.hasVariants && "From "}
          {formatNaira(product.startingPrice)}
        </p>
      </Link>
      <div className="mt-3 flex w-full justify-center">
        <AddToCartButton product={product} />
      </div>
    </div>
  );
}
