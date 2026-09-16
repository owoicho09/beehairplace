import "server-only";

import { and, asc, desc, eq, isNull, ne, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { db } from "@/lib/db";
import {
  categories,
  deliverySettings,
  productMedia,
  productVariants,
  products,
  storeSettings,
} from "@/lib/db/schema";

const PAGE_SIZE = 24;

export type CatalogFilters = {
  categorySlug?: string;
  q?: string;
  sort?: "newest" | "price_asc" | "price_desc";
  cursor?: string;
};

const publishedProduct = and(
  eq(products.publishStatus, "published"),
  isNull(products.archivedAt),
);

export async function getCategories() {
  return db.query.categories.findMany({
    orderBy: [asc(categories.sortOrder), asc(categories.name)],
  });
}

export async function getCatalogPage(filters: CatalogFilters) {
  const conditions = [publishedProduct];

  if (filters.categorySlug) {
    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, filters.categorySlug),
    });
    if (category) {
      conditions.push(eq(products.categoryId, category.id));
    }
  }

  if (filters.q && filters.q.trim().length > 0) {
    conditions.push(
      sql`to_tsvector('english', ${products.name} || ' ' || coalesce(${products.description}, '')) @@ plainto_tsquery('english', ${filters.q.trim()})`,
    );
  }

  const orderBy =
    filters.sort === "price_asc"
      ? [asc(products.basePrice)]
      : filters.sort === "price_desc"
        ? [desc(products.basePrice)]
        : [desc(products.createdAt)];

  const cursorOffset = filters.cursor ? Number(filters.cursor) : 0;

  const rows = await db.query.products.findMany({
    where: and(...conditions),
    orderBy,
    limit: PAGE_SIZE + 1,
    offset: cursorOffset,
    with: {
      media: {
        where: (m, { and, eq, isNull }) =>
          and(eq(m.role, "primary"), isNull(m.deletedAt)),
      },
      variants: { orderBy: (v, { asc }) => asc(v.sortOrder) },
    },
  });

  const hasMore = rows.length > PAGE_SIZE;
  const items = rows.slice(0, PAGE_SIZE).map(toCatalogCard);
  const nextCursor = hasMore ? String(cursorOffset + PAGE_SIZE) : null;

  return { items, nextCursor };
}

function toCatalogCard(
  product: typeof products.$inferSelect & {
    media: (typeof productMedia.$inferSelect)[];
    variants: (typeof productVariants.$inferSelect)[];
  },
) {
  const startingPrice = product.hasVariants
    ? Math.min(...product.variants.map((v) => Number(v.price)))
    : Number(product.basePrice ?? 0);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    startingPrice,
    hasVariants: product.hasVariants,
    posterUrl: product.media[0]?.posterUrl ?? null,
    hasVideo: product.media.some((m) => m.kind === "video" && m.status === "ready"),
  };
}

export async function getFeaturedProducts() {
  const rows = await db.query.products.findMany({
    where: and(publishedProduct, eq(products.isFeatured, true)),
    orderBy: [asc(products.sortOrder)],
    limit: 3,
    with: {
      media: {
        where: (m, { and, eq, isNull }) =>
          and(eq(m.role, "primary"), isNull(m.deletedAt)),
      },
      variants: true,
    },
  });
  return rows.map((product) => ({
    ...toCatalogCard(product),
    videoUrl:
      product.media.find((m) => m.kind === "video" && m.status === "ready")
        ?.processedUrl ?? null,
  }));
}

export async function getBestSellers() {
  const rows = await db.query.products.findMany({
    where: and(publishedProduct, eq(products.isBestSeller, true)),
    orderBy: [asc(products.sortOrder)],
    // Matches the 3-up homepage row (alongside the 3 featured products).
    limit: 3,
    with: {
      media: {
        where: (m, { and, eq, isNull }) =>
          and(eq(m.role, "primary"), isNull(m.deletedAt)),
      },
      variants: true,
    },
  });
  return rows.map(toCatalogCard);
}

export async function getProductBySlug(slug: string) {
  const product = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), publishedProduct),
    with: {
      category: true,
      variants: { orderBy: (v, { asc }) => asc(v.sortOrder) },
      media: {
        where: (m, { isNull }) => isNull(m.deletedAt),
        orderBy: (m, { asc }) => asc(m.sortOrder),
      },
    },
  });
  return product ?? null;
}

export async function getRelatedProducts(params: {
  productId: string;
  categoryId: string | null;
}) {
  const conditions = [publishedProduct, ne(products.id, params.productId)];
  if (params.categoryId) {
    conditions.push(eq(products.categoryId, params.categoryId));
  }

  const rows = await db.query.products.findMany({
    where: and(...conditions),
    orderBy: [desc(products.createdAt)],
    limit: 10,
    with: {
      media: {
        where: (m, { and, eq, isNull }) =>
          and(eq(m.role, "primary"), isNull(m.deletedAt)),
      },
      variants: true,
    },
  });
  return rows.map(toCatalogCard);
}

// store_settings is fetched on every single storefront page render (it
// backs both the footer and the WhatsApp button in the shared layout), but
// only changes when the admin edits it. Under concurrent traffic this was
// enough repeated load on Supabase's pooled connection to occasionally hit
// its statement timeout outright — even the already-cheap, primary-key-only
// version of this query — taking down every storefront page at once, not
// just the homepage. Caching it removes nearly all of that load; admin
// mutations call revalidateTag("store-settings") to invalidate on demand.
const getCachedStoreSettings = unstable_cache(
  async () => {
    const settings = await db.query.storeSettings.findFirst({
      where: eq(storeSettings.id, 1),
    });
    if (!settings) return null;

    // Only the hero video is looked up: the storefront no longer renders a
    // store video anywhere, so fetching it would be wasted work on every
    // page render. (The store_video_media_id column is left in place,
    // unread, rather than requiring a migration to drop it.)
    const heroMedia = settings.heroMediaId
      ? await db.query.productMedia.findFirst({ where: eq(productMedia.id, settings.heroMediaId) })
      : null;

    return { ...settings, heroMedia: heroMedia ?? null };
  },
  ["store-settings"],
  { tags: ["store-settings"], revalidate: 60 },
);

export async function getStoreSettings() {
  return getCachedStoreSettings();
}

export async function getDeliverySettings() {
  return db.query.deliverySettings.findFirst({
    where: eq(deliverySettings.id, 1),
  });
}
