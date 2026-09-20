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
    availability: product.availability,
    posterUrl: product.media[0]?.posterUrl ?? null,
    hasVideo: product.media.some((m) => m.kind === "video" && m.status === "ready"),
  };
}

// getFeaturedProducts, getBestSellers, getCategoryCards, getNewArrival,
// getStoreSettings and getDeliverySettings all run during static generation of "/", "/cart" and
// "/checkout" (next build prerenders any route that doesn't opt out of
// static rendering, which executes their Server Component tree, including
// these DB calls, once at build time). An unguarded throw here — e.g. from
// a misconfigured DATABASE_URL or a transient connection failure — fails
// that page's prerender and takes down the entire `next build`, not just a
// single request. Each is wrapped to degrade to an empty/null result
// instead, exactly like an ordinary "nothing configured yet" state.

export async function getFeaturedProducts() {
  try {
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
    return rows.map(toCatalogCard);
  } catch (error) {
    console.error("getFeaturedProducts failed, degrading gracefully", error);
    return [];
  }
}

export async function getBestSellers() {
  try {
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
  } catch (error) {
    console.error("getBestSellers failed, degrading gracefully", error);
    return [];
  }
}

// Category cards on the homepage show a real product poster: categories have
// no image of their own, so each one borrows the newest published product's
// poster. Categories with no published products are omitted (they would be an
// empty shop page). Guarded like the other homepage queries — see above.
export async function getCategoryCards() {
  try {
    const rows = await db.query.categories.findMany({
      orderBy: [asc(categories.sortOrder), asc(categories.name)],
      with: {
        products: {
          where: (p, { and, eq, isNull }) =>
            and(eq(p.publishStatus, "published"), isNull(p.archivedAt)),
          orderBy: (p, { desc }) => desc(p.createdAt),
          limit: 1,
          with: {
            media: {
              where: (m, { and, eq, isNull }) =>
                and(eq(m.role, "primary"), isNull(m.deletedAt)),
            },
          },
        },
      },
    });
    return rows
      .filter((category) => category.products.length > 0)
      .map((category) => ({
        slug: category.slug,
        name: category.name,
        posterUrl: category.products[0].media[0]?.posterUrl ?? null,
      }));
  } catch (error) {
    console.error("getCategoryCards failed, degrading gracefully", error);
    return [];
  }
}

// Backs the "New Arrival Collection" banner: the most recently added
// published product supplies the banner image. Nothing is hard-coded.
export async function getNewArrival() {
  try {
    const rows = await db.query.products.findMany({
      where: publishedProduct,
      orderBy: [desc(products.createdAt)],
      limit: 5,
      with: {
        media: {
          where: (m, { and, eq, isNull }) =>
            and(eq(m.role, "primary"), isNull(m.deletedAt)),
        },
      },
    });
    const withPoster = rows.find((p) => p.media[0]?.posterUrl);
    if (!withPoster) return null;
    return { posterUrl: withPoster.media[0].posterUrl as string };
  } catch (error) {
    console.error("getNewArrival failed, degrading gracefully", error);
    return null;
  }
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

    const [heroMedia, storeVideoMedia] = await Promise.all([
      settings.heroMediaId
        ? db.query.productMedia.findFirst({ where: eq(productMedia.id, settings.heroMediaId) })
        : null,
      settings.storeVideoMediaId
        ? db.query.productMedia.findFirst({ where: eq(productMedia.id, settings.storeVideoMediaId) })
        : null,
    ]);

    return { ...settings, heroMedia: heroMedia ?? null, storeVideoMedia: storeVideoMedia ?? null };
  },
  ["store-settings"],
  { tags: ["store-settings"], revalidate: 60 },
);

export async function getStoreSettings() {
  try {
    return await getCachedStoreSettings();
  } catch (error) {
    console.error("getStoreSettings failed, degrading gracefully", error);
    return null;
  }
}

export async function getDeliverySettings() {
  try {
    return await db.query.deliverySettings.findFirst({
      where: eq(deliverySettings.id, 1),
    });
  } catch (error) {
    console.error("getDeliverySettings failed, degrading gracefully", error);
    return null;
  }
}
