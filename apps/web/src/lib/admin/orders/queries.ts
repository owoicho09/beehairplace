import "server-only";

import { and, desc, eq, or, ilike } from "drizzle-orm";

import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";

export type OrderListFilter = "all" | "processing" | "ready_for_pickup" | "out_for_delivery" | "completed" | "cancelled";

export async function getAdminOrders(params: { filter: OrderListFilter; q?: string }) {
  const conditions = [];
  if (params.filter !== "all") {
    conditions.push(eq(orders.fulfilmentStatus, params.filter));
  }
  if (params.q?.trim()) {
    const term = `%${params.q.trim()}%`;
    conditions.push(
      or(
        ilike(orders.orderNumber, term),
        ilike(orders.customerName, term),
        ilike(orders.email, term),
        ilike(orders.phone, term),
      ),
    );
  }

  return db.query.orders.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(orders.createdAt)],
    limit: 100,
  });
}

export async function getAdminOrderById(id: string) {
  return db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { items: true },
  });
}
