import "server-only";

import { db } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";
import { initializeTransaction } from "@/lib/payments/paystack";
import type { CheckoutInput } from "@/lib/validation/checkout";

import {
  calculateDeliveryFee,
  generateOrderNumber,
  generatePaystackReference,
  priceCart,
} from "./pricing";

export async function createOrderFromCheckout(input: CheckoutInput) {
  const { lineItems, subtotal } = await priceCart(input.items);

  const deliveryFee = await calculateDeliveryFee({
    fulfilmentMethod: input.fulfilmentMethod,
    zone: input.deliveryAddress?.zone ?? null,
    subtotal,
  });

  const total = subtotal + deliveryFee;
  const orderNumber = generateOrderNumber();
  const reference = generatePaystackReference();

  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      customerName: input.customerName,
      email: input.email,
      phone: input.phone,
      fulfilmentMethod: input.fulfilmentMethod,
      deliveryAddress:
        input.fulfilmentMethod === "delivery" ? input.deliveryAddress : null,
      deliveryFee: deliveryFee.toFixed(2),
      subtotal: subtotal.toFixed(2),
      total: total.toFixed(2),
      paystackReference: reference,
    })
    .returning();

  await db.insert(orderItems).values(
    lineItems.map((li) => ({
      orderId: order.id,
      productId: li.productId,
      productNameSnapshot: li.productName,
      variantLabelSnapshot: li.variantLabel,
      unitPriceSnapshot: li.unitPrice.toFixed(2),
      quantity: li.quantity,
      posterUrlSnapshot: li.posterUrl,
    })),
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const initialized = await initializeTransaction({
    email: input.email,
    amountNaira: total,
    reference,
    callbackUrl: `${siteUrl}/order/${orderNumber}`,
    metadata: { orderNumber, orderId: order.id },
  });

  return {
    orderNumber,
    reference,
    accessCode: initialized.data.access_code,
    total,
  };
}
