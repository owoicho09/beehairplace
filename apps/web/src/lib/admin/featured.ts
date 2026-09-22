import "server-only";

import { and, eq, ne } from "drizzle-orm";

import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";

/**
 * The featured section is intentionally small (it's the 2x2 showcase grid
 * on the homepage) — enforced here so it can't be bypassed from either
 * place that can set isFeatured (the product edit form, and the homepage
 * merchandising picker).
 */
export const MAX_FEATURED_PRODUCTS = 4;

export async function canFeatureAnotherProduct(excludeProductId?: string): Promise<boolean> {
  const conditions = [eq(products.isFeatured, true)];
  if (excludeProductId) conditions.push(ne(products.id, excludeProductId));

  const currentlyFeatured = await db.query.products.findMany({
    where: and(...conditions),
    columns: { id: true },
  });
  return currentlyFeatured.length < MAX_FEATURED_PRODUCTS;
}
