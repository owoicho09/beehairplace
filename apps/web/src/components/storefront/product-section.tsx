import Link from "next/link";

import { ProductCard, type ProductCardData } from "./product-card";

/**
 * Homepage product block. `centered` is the "Featured Products" layout
 * (centered heading + subtitle, View All below the grid); the default is the
 * "Trending Now" layout (left heading, Browse Shop button on the right).
 */
export function ProductSection({
  title,
  subtitle,
  products,
  href,
  linkLabel,
  centered = false,
}: {
  title: string;
  subtitle?: string;
  products: ProductCardData[];
  href?: string;
  linkLabel?: string;
  centered?: boolean;
}) {
  if (products.length === 0) return null;

  const linkButton = href && linkLabel && (
    <Link
      href={href}
      className="inline-flex items-center gap-2 bg-store-tint px-5 py-2.5 text-sm font-medium text-store-ink transition-colors hover:bg-brand hover:text-white"
    >
      {linkLabel}
      <span aria-hidden="true">→</span>
    </Link>
  );

  return (
    <section className="store-container py-12 md:py-16">
      {centered ? (
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold md:text-3xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm text-store-muted">{subtitle}</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <h2 className="font-heading text-2xl font-bold md:text-3xl">
            {title}
          </h2>
          {linkButton}
        </div>
      )}

      <div
        className={`mt-8 flex flex-wrap gap-x-3 gap-y-8 sm:gap-x-4 ${
          centered ? "justify-center" : "justify-start"
        }`}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[calc(50%-0.375rem)] sm:w-[calc(50%-0.5rem)] md:w-[calc(25%-0.75rem)]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {centered && linkButton && (
        <div className="mt-10 flex justify-center">{linkButton}</div>
      )}
    </section>
  );
}
