import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { verifyTransaction } from "@/lib/payments/paystack";

/**
 * Confirms payment for an order by re-verifying with Paystack directly
 * (never trusting the caller). Idempotent: safe to call from both the
 * client's post-payment callback and the webhook, in either order.
 */
export async function finalizeOrderPayment(reference: string) {
  const order = await db.query.orders.findFirst({
    where: eq(orders.paystackReference, reference),
  });

  if (!order) {
    throw new Error(`No order found for reference ${reference}`);
  }

  if (order.paymentStatus === "paid") {
    return order; // already finalized, nothing to do
  }

  const verification = await verifyTransaction(reference);

  if (verification.data.status !== "success") {
    if (order.paymentStatus !== "failed") {
      await db
        .update(orders)
        .set({ paymentStatus: "failed" })
        .where(eq(orders.id, order.id));
    }
    return { ...order, paymentStatus: "failed" as const };
  }

  const expectedKobo = Math.round(Number(order.total) * 100);
  if (verification.data.amount !== expectedKobo) {
    throw new Error(
      `Amount mismatch for order ${order.orderNumber}: expected ${expectedKobo}, got ${verification.data.amount}`,
    );
  }

  const [updated] = await db
    .update(orders)
    .set({
      paymentStatus: "paid",
      paidAt: new Date(),
    })
    .where(eq(orders.id, order.id))
    .returning();

  return updated;
}
