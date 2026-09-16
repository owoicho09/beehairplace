"use server";

import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { MAX_FEATURED_PRODUCTS, canFeatureAnotherProduct } from "@/lib/admin/featured";
import { requireAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { categories, productMedia, productVariants, products } from "@/lib/db/schema";
import { getMediaStorage } from "@/lib/media/storage";
import { triggerMediaProcessing } from "@/lib/media/worker-client";
import { slugify } from "@/lib/utils";

const variantSchema = z.object({
  label: z.string().trim().min(1),
  price: z.coerce.number().positive(),
  availability: z.enum(["in_stock", "out_of_stock"]),
});

const productInputSchema = z.object({
  name: z.string().trim().min(2),
  categoryId: z.string().uuid().nullable(),
  description: z.string().trim().optional(),
  hasVariants: z.boolean(),
  // No positivity constraint at the schema level: a draft is allowed to
  // have no price yet (e.g. pricing not decided). Completeness is only
  // enforced by hasValidPricing() below, at the moment of publishing.
  basePrice: z.coerce.number().nullable(),
  variants: z.array(variantSchema),
  availability: z.enum(["in_stock", "out_of_stock"]),
  publishStatus: z.enum(["draft", "published"]),
  isFeatured: z.boolean(),
  isBestSeller: z.boolean(),
});

export type ProductInput = z.infer<typeof productInputSchema>;

/** Resolves the value to store in products.base_price: null unless it's a positive, non-variant price. */
function resolveBasePrice(data: ProductInput): string | null {
  if (data.hasVariants) return null;
  if (data.basePrice !== null && data.basePrice > 0) return String(data.basePrice);
  return null;
}

/** A product needs a real, complete price (base price, or at least one variant) before it can be published. */
function hasValidPricing(data: ProductInput): boolean {
  if (data.hasVariants) {
    return data.variants.length > 0 && data.variants.every((v) => v.price > 0);
  }
  return data.basePrice !== null && data.basePrice > 0;
}

async function uniqueSlug(name: string, excludeId?: string) {
  const base = slugify(name);
  let candidate = base;
  let suffix = 1;
  while (true) {
    const existing = await db.query.products.findFirst({
      where: eq(products.slug, candidate),
    });
    if (!existing || existing.id === excludeId) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

export async function createProduct(input: ProductInput) {
  await requireAdmin();
  const data = productInputSchema.parse(input);
  const slug = await uniqueSlug(data.name);

  const [product] = await db
    .insert(products)
    .values({
      slug,
      name: data.name,
      categoryId: data.categoryId,
      description: data.description || null,
      basePrice: resolveBasePrice(data),
      hasVariants: data.hasVariants,
      availability: data.availability,
      // Always created as a draft: a product needs a video before it can be
      // published, and media can only be attached once the product exists.
      publishStatus: "draft",
      isFeatured: false,
      isBestSeller: false,
    })
    .returning();

  if (data.hasVariants && data.variants.length > 0) {
    await db.insert(productVariants).values(
      data.variants.map((v, i) => ({
        productId: product.id,
        label: v.label,
        price: String(v.price),
        availability: v.availability,
        sortOrder: i,
      })),
    );
  }

  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}/edit`);
}

export async function updateProduct(
  productId: string,
  input: ProductInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  const parsed = productInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid product details" };
  }
  const data = parsed.data;

  const existing = await db.query.products.findFirst({
    where: eq(products.id, productId),
  });
  if (!existing) throw new Error("Product not found");

  if (data.isFeatured && !existing.isFeatured) {
    if (!(await canFeatureAnotherProduct(productId))) {
      return {
        ok: false,
        error: `Only ${MAX_FEATURED_PRODUCTS} products can be featured at once. Unfeature one first.`,
      };
    }
  }

  if (data.publishStatus === "published") {
    if (!hasValidPricing(data)) {
      return {
        ok: false,
        error: data.hasVariants
          ? "Add at least one length/option with a price before publishing."
          : "Enter a price before publishing.",
      };
    }

    const readyVideo = await db.query.productMedia.findFirst({
      where: (m, { and, eq, isNull }) =>
        and(
          eq(m.productId, productId),
          eq(m.role, "primary"),
          eq(m.kind, "video"),
          eq(m.status, "ready"),
          isNull(m.deletedAt),
        ),
    });
    if (!readyVideo) {
      return {
        ok: false,
        error: "Add and finish processing a product video before publishing.",
      };
    }
  }

  const slug =
    existing.name === data.name ? existing.slug : await uniqueSlug(data.name, productId);

  await db
    .update(products)
    .set({
      slug,
      name: data.name,
      categoryId: data.categoryId,
      description: data.description || null,
      basePrice: resolveBasePrice(data),
      hasVariants: data.hasVariants,
      availability: data.availability,
      publishStatus: data.publishStatus,
      isFeatured: data.isFeatured,
      isBestSeller: data.isBestSeller,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));

  await db.delete(productVariants).where(eq(productVariants.productId, productId));
  if (data.hasVariants && data.variants.length > 0) {
    await db.insert(productVariants).values(
      data.variants.map((v, i) => ({
        productId,
        label: v.label,
        price: String(v.price),
        availability: v.availability,
        sortOrder: i,
      })),
    );
  }

  revalidatePath("/shop");
  revalidatePath(`/shop/${slug}`);
  revalidatePath("/admin/products");
  return { ok: true };
}

export async function archiveProduct(productId: string) {
  await requireAdmin();
  await db
    .update(products)
    .set({ archivedAt: new Date(), publishStatus: "draft" })
    .where(eq(products.id, productId));
  revalidatePath("/shop");
  revalidatePath("/admin/products");
}

export async function duplicateProduct(productId: string) {
  await requireAdmin();
  const original = await db.query.products.findFirst({
    where: eq(products.id, productId),
    with: { variants: true },
  });
  if (!original) throw new Error("Product not found");

  const name = `${original.name} (copy)`;
  const slug = await uniqueSlug(name);

  const [copy] = await db
    .insert(products)
    .values({
      slug,
      name,
      categoryId: original.categoryId,
      description: original.description,
      basePrice: original.basePrice,
      hasVariants: original.hasVariants,
      availability: original.availability,
      publishStatus: "draft",
      isFeatured: false,
      isBestSeller: false,
    })
    .returning();

  if (original.variants.length > 0) {
    await db.insert(productVariants).values(
      original.variants.map((v) => ({
        productId: copy.id,
        label: v.label,
        price: v.price,
        availability: v.availability,
        sortOrder: v.sortOrder,
      })),
    );
  }

  revalidatePath("/admin/products");
  redirect(`/admin/products/${copy.id}/edit`);
}

export async function createCategoryInline(name: string) {
  await requireAdmin();
  const slug = slugify(name);
  const [category] = await db
    .insert(categories)
    .values({ name, slug })
    .onConflictDoNothing({ target: categories.slug })
    .returning();

  if (category) {
    revalidatePath("/admin/categories");
    return category;
  }
  return db.query.categories.findFirst({ where: eq(categories.slug, slug) });
}

// -- Media --

export async function requestMediaUpload(params: {
  productId: string;
  kind: "video" | "photo";
  role: "primary" | "gallery";
  fileExtension: string;
}) {
  await requireAdmin();
  const storage = getMediaStorage();
  const rawPath = `${params.productId}/${randomUUID()}.${params.fileExtension}`;

  const [media] = await db
    .insert(productMedia)
    .values({
      productId: params.productId,
      kind: params.kind,
      role: params.role,
      status: "pending",
      rawPath,
    })
    .returning();

  const { uploadUrl, token } = await storage.createUploadUrl("raw", rawPath);
  return {
    mediaId: media.id,
    uploadUrl,
    token,
    rawPath,
    bucket: process.env.SUPABASE_RAW_MEDIA_BUCKET!,
  };
}

export async function confirmMediaUploaded(mediaId: string) {
  await requireAdmin();
  const storage = getMediaStorage();

  const media = await db.query.productMedia.findFirst({
    where: eq(productMedia.id, mediaId),
  });
  if (!media) throw new Error("Media not found");

  if (media.kind === "photo") {
    // Photos need no processing: publish the raw upload directly.
    const publicUrl = storage.getPublicUrl(media.rawPath);
    await db
      .update(productMedia)
      .set({ status: "ready", processedUrl: publicUrl, posterUrl: publicUrl })
      .where(eq(productMedia.id, mediaId));
    revalidatePath("/admin/products");
    return;
  }

  await db
    .update(productMedia)
    .set({ status: "processing" })
    .where(eq(productMedia.id, mediaId));

  const downloadUrl = await storage.createDownloadUrl("raw", media.rawPath);

  try {
    await triggerMediaProcessing({
      mediaId: media.id,
      rawPath: media.rawPath,
      downloadUrl,
    });
  } catch (error) {
    await db
      .update(productMedia)
      .set({
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Failed to start processing",
      })
      .where(eq(productMedia.id, mediaId));
  }

  revalidatePath("/admin/products");
}

export async function retryMediaProcessing(mediaId: string) {
  await requireAdmin();
  await confirmMediaUploaded(mediaId);
}

export async function deleteMedia(mediaId: string) {
  await requireAdmin();

  const media = await db.query.productMedia.findFirst({
    where: eq(productMedia.id, mediaId),
  });

  // Soft-delete immediately so the media disappears from the storefront and
  // admin right away; the cleanup cron does the actual storage deletion,
  // retrying if a first attempt fails rather than orphaning files silently.
  await db
    .update(productMedia)
    .set({ deletedAt: new Date() })
    .where(eq(productMedia.id, mediaId));

  // There is no atomic "replace video" action — replacing one means
  // deleting the old one, then uploading a new one, which briefly leaves
  // the product with no primary video. If that product is published and
  // this was its only ready primary video, unpublish it immediately rather
  // than let a published product sit live with nothing to play — the admin
  // can republish once a new video finishes processing.
  if (media?.productId && media.role === "primary") {
    const product = await db.query.products.findFirst({
      where: eq(products.id, media.productId),
    });
    if (product?.publishStatus === "published") {
      const remainingReadyVideo = await db.query.productMedia.findFirst({
        where: (m, { and, eq, isNull, ne }) =>
          and(
            eq(m.productId, media.productId!),
            eq(m.role, "primary"),
            eq(m.kind, "video"),
            eq(m.status, "ready"),
            isNull(m.deletedAt),
            ne(m.id, mediaId),
          ),
      });
      if (!remainingReadyVideo) {
        await db
          .update(products)
          .set({ publishStatus: "draft" })
          .where(eq(products.id, media.productId));
        revalidatePath(`/shop/${product.slug}`);
      }
    }
  }

  revalidatePath("/shop");
  revalidatePath("/admin/products");
}
