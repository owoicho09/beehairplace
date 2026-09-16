"use server";

import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

import { MAX_FEATURED_PRODUCTS, canFeatureAnotherProduct } from "@/lib/admin/featured";
import { requireAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { productMedia, products, storeSettings } from "@/lib/db/schema";
import { getMediaStorage } from "@/lib/media/storage";
import { triggerMediaProcessing } from "@/lib/media/worker-client";

async function ensureSettingsRow() {
  await db
    .insert(storeSettings)
    .values({ id: 1 })
    .onConflictDoNothing({ target: storeSettings.id });
}

export async function requestStoreMediaUpload(params: { fileExtension: string }) {
  await requireAdmin();
  const storage = getMediaStorage();
  const rawPath = `store/hero/${randomUUID()}.${params.fileExtension}`;

  const [media] = await db
    .insert(productMedia)
    .values({
      productId: null,
      kind: "video",
      role: "store",
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

export async function confirmStoreMediaUploaded(mediaId: string) {
  await requireAdmin();
  await ensureSettingsRow();

  const media = await db.query.productMedia.findFirst({ where: eq(productMedia.id, mediaId) });
  if (!media) throw new Error("Media not found");

  const current = await db.query.storeSettings.findFirst({ where: eq(storeSettings.id, 1) });
  const previousMediaId = current?.heroMediaId;

  await db
    .update(storeSettings)
    .set({ heroMediaId: mediaId })
    .where(eq(storeSettings.id, 1));

  if (previousMediaId && previousMediaId !== mediaId) {
    await db
      .update(productMedia)
      .set({ deletedAt: new Date() })
      .where(eq(productMedia.id, previousMediaId));
  }

  const storage = getMediaStorage();
  await db.update(productMedia).set({ status: "processing" }).where(eq(productMedia.id, mediaId));
  const downloadUrl = await storage.createDownloadUrl("raw", media.rawPath);

  try {
    await triggerMediaProcessing({ mediaId: media.id, rawPath: media.rawPath, downloadUrl });
  } catch (error) {
    await db
      .update(productMedia)
      .set({
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Failed to start processing",
      })
      .where(eq(productMedia.id, mediaId));
  }

  revalidateTag("store-settings", "max");
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function setFeatured(productId: string, featured: boolean) {
  await requireAdmin();

  if (featured && !(await canFeatureAnotherProduct(productId))) {
    return {
      ok: false as const,
      error: `Only ${MAX_FEATURED_PRODUCTS} products can be featured at once.`,
    };
  }

  await db.update(products).set({ isFeatured: featured }).where(eq(products.id, productId));
  revalidatePath("/");
  revalidatePath("/admin/homepage");
  return { ok: true as const };
}

export async function setBestSeller(productId: string, bestSeller: boolean) {
  await requireAdmin();
  await db.update(products).set({ isBestSeller: bestSeller }).where(eq(products.id, productId));
  revalidatePath("/");
  revalidatePath("/admin/homepage");
  return { ok: true as const };
}
