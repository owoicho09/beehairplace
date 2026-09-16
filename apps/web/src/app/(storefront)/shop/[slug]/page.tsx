import { notFound } from "next/navigation";

import { ProductVideoPlayer } from "@/components/storefront/product-video-player";
import { PurchasePanel } from "@/components/storefront/purchase-panel";
import { RelatedCarousel } from "@/components/storefront/related-carousel";
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
    (m) => m.role === "primary" && m.kind === "video",
  );
  const gallery = product.media.filter((m) => m.role === "gallery");

  const related = await getRelatedProducts({
    productId: product.id,
    categoryId: product.categoryId,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:grid sm:grid-cols-2 sm:gap-10 sm:px-6">
      <div>
        <ProductVideoPlayer
          videoUrl={primaryVideo?.processedUrl ?? null}
          posterUrl={primaryVideo?.posterUrl ?? null}
        />
        {gallery.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {gallery.map((photo) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={photo.id}
                src={photo.processedUrl ?? photo.posterUrl ?? ""}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 sm:mt-0">
        <h1 className="font-editorial text-2xl">{product.name}</h1>

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

        {product.description && (
          <p className="mt-8 whitespace-pre-line text-sm text-ink-soft">
            {product.description}
          </p>
        )}
      </div>

      <div className="sm:col-span-2">
        <RelatedCarousel products={related} />
      </div>
    </div>
  );
}
