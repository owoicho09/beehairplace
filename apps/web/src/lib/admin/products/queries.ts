import "server-only";

import { and, desc, eq, ilike, isNotNull, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";

export type AdminProductFilter = "all" | "draft" | "published" | "archived";

export async function getAdminProducts(params: {
  filter: AdminProductFilter;
  q?: string;
}) {
  const conditions = [];

  if (params.filter === "archived") {
    conditions.push(isNotNull(products.archivedAt));
  } else {
    conditions.push(isNull(products.archivedAt));
    if (params.filter === "draft") conditions.push(eq(products.publishStatus, "draft"));
    if (params.filter === "published") conditions.push(eq(products.publishStatus, "published"));
  }

  if (params.q?.trim()) {
    conditions.push(ilike(products.name, `%${params.q.trim()}%`));
  }

  return db.query.products.findMany({
    where: and(...conditions),
    orderBy: [desc(products.createdAt)],
    with: {
      category: true,
      media: {
        where: (m, { and, eq, isNull }) =>
          and(eq(m.role, "primary"), isNull(m.deletedAt)),
      },
    },
    limit: 100,
  });
}

export async function getPublishedProductsForMerchandising() {
  return db.query.products.findMany({
    where: and(eq(products.publishStatus, "published"), isNull(products.archivedAt)),
    orderBy: [desc(products.createdAt)],
    columns: { id: true, name: true, isFeatured: true, isBestSeller: true },
  });
}

export async function getAdminProductById(productId: string) {
  return db.query.products.findFirst({
    where: eq(products.id, productId),
    with: {
      variants: { orderBy: (v, { asc }) => asc(v.sortOrder) },
      media: {
        where: (m, { isNull }) => isNull(m.deletedAt),
        orderBy: (m, { asc }) => asc(m.sortOrder),
      },
    },
  });
}
