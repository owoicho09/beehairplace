import { notFound } from "next/navigation";

import { MediaManager } from "@/components/admin/media-manager";
import { ProductForm } from "@/components/admin/product-form";
import { ProductActions } from "@/components/admin/product-actions";
import { getAdminProductById } from "@/lib/admin/products/queries";
import { getCategories } from "@/lib/catalog/queries";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    getCategories(),
  ]);

  if (!product) notFound();

  const primaryVideo = product.media.find((m) => m.role === "primary") ?? null;
  const gallery = product.media.filter((m) => m.role === "gallery");

  return (
    <div className="max-w-lg">
      <div className="flex items-center justify-between">
        <h1 className="font-editorial text-2xl">{product.name}</h1>
        <ProductActions productId={product.id} />
      </div>

      <div className="mt-6">
        <MediaManager
          productId={product.id}
          primaryVideo={
            primaryVideo && {
              id: primaryVideo.id,
              kind: primaryVideo.kind,
              role: primaryVideo.role,
              status: primaryVideo.status,
              posterUrl: primaryVideo.posterUrl,
              errorMessage: primaryVideo.errorMessage,
            }
          }
          gallery={gallery.map((g) => ({
            id: g.id,
            kind: g.kind,
            role: g.role,
            status: g.status,
            posterUrl: g.posterUrl,
            errorMessage: g.errorMessage,
          }))}
        />
      </div>

      <div className="mt-8 border-t border-line pt-6">
        <ProductForm
          productId={product.id}
          categories={categories}
          defaultValues={{
            name: product.name,
            categoryId: product.categoryId,
            description: product.description ?? "",
            hasVariants: product.hasVariants,
            basePrice: product.basePrice ? Number(product.basePrice) : null,
            variants: product.variants.map((v) => ({
              label: v.label,
              price: Number(v.price),
              availability: v.availability,
            })),
            availability: product.availability,
            publishStatus: product.publishStatus,
            isFeatured: product.isFeatured,
            isBestSeller: product.isBestSeller,
          }}
        />
      </div>
    </div>
  );
}
