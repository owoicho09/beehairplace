"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";

type FulfilmentStatus =
  | "processing"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

const VALID_TRANSITIONS: Record<FulfilmentStatus, FulfilmentStatus[]> = {
  processing: ["ready_for_pickup", "out_for_delivery", "cancelled"],
  ready_for_pickup: ["completed", "cancelled"],
  out_for_delivery: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export async function updateFulfilmentStatus(orderId: string, status: FulfilmentStatus) {
  await requireAdmin();

  const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
  if (!order) throw new Error("Order not found");

  const allowed = VALID_TRANSITIONS[order.fulfilmentStatus] ?? [];
  if (!allowed.includes(status)) {
    throw new Error(`Cannot move order from ${order.fulfilmentStatus} to ${status}`);
  }

  await db.update(orders).set({ fulfilmentStatus: status }).where(eq(orders.id, orderId));
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
