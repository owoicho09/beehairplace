import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ProductGallery,
  type GalleryItem,
} from "@/components/storefront/product-gallery";
import { ProductSection } from "@/components/storefront/product-section";
import { ProductTabs, type ProductTab } from "@/components/storefront/product-tabs";
import { PurchasePanel } from "@/components/storefront/purchase-panel";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog/queries";

export const revalidate = 300;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const primaryVideo = product.media.find(
    (m) =>
      m.role === "primary" &&
      m.kind === "video" &&
      m.status === "ready" &&
      m.processedUrl,
  );

  const galleryItems: GalleryItem[] = [];
  if (primaryVideo?.processedUrl) {
    galleryItems.push({
      id: primaryVideo.id,
      kind: "video",
      url: primaryVideo.processedUrl,
      posterUrl: primaryVideo.posterUrl,
    });
  }
  for (const photo of product.media) {
    if (photo.role !== "gallery" || photo.kind !== "photo") continue;
    const url = photo.processedUrl ?? photo.posterUrl;
    if (url) {
      galleryItems.push({
        id: photo.id,
        kind: "photo",
        url,
        posterUrl: photo.posterUrl,
      });
    }
  }

  const related = (
    await getRelatedProducts({
      productId: product.id,
      categoryId: product.categoryId,
    })
  ).slice(0, 4);

  const inStock =
    product.hasVariants && product.variants.length > 0
      ? product.variants.some((v) => v.availability === "in_stock")
      : product.availability === "in_stock";

  const infoRows: { label: string; value: string }[] = [];
  if (product.variants.length > 0) {
    infoRows.push({
      label: "Lengths",
      value: product.variants.map((v) => v.label).join(", "),
    });
  }
  infoRows.push({
    label: "Availability",
    value: inStock ? "In stock" : "Out of stock",
  });

  const tabs: ProductTab[] = [];
  if (product.description) {
    tabs.push({
      id: "description",
      label: "Description",
      content: <p className="whitespace-pre-line">{product.description}</p>,
    });
  }
  tabs.push({
    id: "info",
    label: "Additional information",
    content: (
      <dl className="border border-store-line">
        {infoRows.map((row, i) => (
          <div
            key={row.label}
            className={`grid grid-cols-[8rem_1fr] px-4 py-3 ${
              i % 2 === 1 ? "bg-store-tint/60" : ""
            }`}
          >
            <dt className="font-medium text-store-ink">{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    ),
  });

  return (
    <>
      <div className="store-container py-6 md:py-10">
        <nav
          aria-label="Breadcrumb"
          className="text-[11px] font-medium uppercase tracking-wide text-store-muted"
        >
          <Link href="/" className="hover:text-brand">
            Home
          </Link>
          {product.category && (
            <>
              <span className="mx-2">/</span>
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="hover:text-brand"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-store-ink">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
          <ProductGallery items={galleryItems} name={product.name} />

          <div>
            <h1 className="font-heading text-2xl font-bold leading-snug md:text-3xl">
              {product.name}
            </h1>
            <div className="mt-4">
              <PurchasePanel
                productId={product.id}
                slug={product.slug}
                name={product.name}
                posterUrl={primaryVideo?.posterUrl ?? null}
                basePrice={product.basePrice ? Number(product.basePrice) : null}
                availability={product.availability}
                variants={product.variants.map((v) => ({
                  id: v.id,
                  label: v.label,
                  price: Number(v.price),
                  availability: v.availability,
                }))}
              />
            </div>

            {product.category && (
              <p className="mt-5 text-[11px] font-medium uppercase tracking-wide text-store-muted">
                Category:{" "}
                <Link
                  href={`/shop?category=${product.category.slug}`}
                  className="text-store-ink hover:text-brand"
                >
                  {product.category.name}
                </Link>
              </p>
            )}
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <ProductTabs tabs={tabs} />
        </div>
      </div>

      <ProductSection title="Related products" products={related} />
    </>
  );
}
