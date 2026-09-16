import "server-only";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { deliverySettings, products } from "@/lib/db/schema";

export type CartInput = {
  productId: string;
  variantId: string | null;
  quantity: number;
};

export type PricedLineItem = {
  productId: string;
  productName: string;
  variantId: string | null;
  variantLabel: string | null;
  unitPrice: number;
  quantity: number;
  posterUrl: string | null;
  available: boolean;
};

export class CartValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super(issues.join("; "));
  }
}

/**
 * Resolves cart line items against the live database. Never trust
 * client-supplied prices — this is the only place an order's amounts
 * are computed.
 */
export async function priceCart(items: CartInput[]): Promise<{
  lineItems: PricedLineItem[];
  subtotal: number;
}> {
  if (items.length === 0) {
    throw new CartValidationError(["Cart is empty"]);
  }

  const issues: string[] = [];
  const lineItems: PricedLineItem[] = [];

  for (const item of items) {
    const product = await db.query.products.findFirst({
      where: and(eq(products.id, item.productId), isNull(products.archivedAt)),
      with: {
        variants: true,
        media: {
          where: (m, { and, eq, isNull }) =>
            and(eq(m.role, "primary"), isNull(m.deletedAt)),
        },
      },
    });

    if (!product || product.publishStatus !== "published") {
      issues.push(`A product in your cart is no longer available.`);
      continue;
    }

    const poster = product.media[0]?.posterUrl ?? null;

    if (product.hasVariants) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant) {
        issues.push(`${product.name}: selected option is no longer available.`);
        continue;
      }
      const available = variant.availability === "in_stock";
      lineItems.push({
        productId: product.id,
        productName: product.name,
        variantId: variant.id,
        variantLabel: variant.label,
        unitPrice: Number(variant.price),
        quantity: item.quantity,
        posterUrl: poster,
        available,
      });
    } else {
      if (product.basePrice === null) {
        issues.push(`${product.name}: pricing is unavailable right now.`);
        continue;
      }
      const available = product.availability === "in_stock";
      lineItems.push({
        productId: product.id,
        productName: product.name,
        variantId: null,
        variantLabel: null,
        unitPrice: Number(product.basePrice),
        quantity: item.quantity,
        posterUrl: poster,
        available,
      });
    }
  }

  const unavailable = lineItems.filter((li) => !li.available);
  if (unavailable.length > 0) {
    issues.push(
      `${unavailable.map((li) => li.productName).join(", ")} ${
        unavailable.length === 1 ? "is" : "are"
      } currently out of stock.`,
    );
  }

  if (issues.length > 0) {
    throw new CartValidationError(issues);
  }

  const subtotal = lineItems.reduce(
    (sum, li) => sum + li.unitPrice * li.quantity,
    0,
  );

  return { lineItems, subtotal };
}

export async function calculateDeliveryFee(params: {
  fulfilmentMethod: "delivery" | "pickup";
  zone: string | null;
  subtotal: number;
}): Promise<number> {
  if (params.fulfilmentMethod === "pickup") return 0;

  const settings = await db.query.deliverySettings.findFirst({
    where: eq(deliverySettings.id, 1),
  });
  if (!settings) return 0;

  if (
    settings.freeDeliveryThreshold !== null &&
    params.subtotal >= Number(settings.freeDeliveryThreshold)
  ) {
    return 0;
  }

  if (params.zone) {
    const zoneMatch = settings.zoneFees.find((z) => z.zone === params.zone);
    if (zoneMatch) return zoneMatch.fee;
  }

  return Number(settings.flatFee);
}

export function generateOrderNumber(): string {
  const date = new Date();
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `BHP-${datePart}-${randomPart}`;
}

export function generatePaystackReference(): string {
  return `bhp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
