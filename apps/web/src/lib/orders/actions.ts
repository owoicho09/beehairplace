"use server";

import { checkoutSchema } from "@/lib/validation/checkout";

import { createOrderFromCheckout } from "./checkout";
import { finalizeOrderPayment } from "./finalize";
import { CartValidationError } from "./pricing";

export type CheckoutActionResult =
  | {
      ok: true;
      orderNumber: string;
      reference: string;
      accessCode: string;
    }
  | { ok: false; error: string };

export async function submitCheckout(
  input: unknown,
): Promise<CheckoutActionResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid checkout details" };
  }

  if (parsed.data.fulfilmentMethod === "delivery" && !parsed.data.deliveryAddress) {
    return { ok: false, error: "Delivery address is required" };
  }

  try {
    const result = await createOrderFromCheckout(parsed.data);
    return {
      ok: true,
      orderNumber: result.orderNumber,
      reference: result.reference,
      accessCode: result.accessCode,
    };
  } catch (error) {
    if (error instanceof CartValidationError) {
      return { ok: false, error: error.issues[0] };
    }
    console.error("Checkout failed", error);
    return { ok: false, error: "Something went wrong creating your order. Please try again." };
  }
}

export type FinalizeActionResult =
  | { ok: true; paymentStatus: "paid" | "failed"; orderNumber: string }
  | { ok: false; error: string };

export async function finalizeOrder(
  reference: string,
): Promise<FinalizeActionResult> {
  try {
    const order = await finalizeOrderPayment(reference);
    return {
      ok: true,
      paymentStatus: order.paymentStatus as "paid" | "failed",
      orderNumber: order.orderNumber,
    };
  } catch (error) {
    console.error("Finalize order failed", error);
    return { ok: false, error: "Could not confirm payment status." };
  }
}
