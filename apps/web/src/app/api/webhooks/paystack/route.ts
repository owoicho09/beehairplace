import { NextResponse } from "next/server";

import { finalizeOrderPayment } from "@/lib/orders/finalize";
import { isValidWebhookSignature } from "@/lib/payments/paystack";

// Paystack webhooks: verified by signature here, then re-confirmed against
// the Verify API inside finalizeOrderPayment. This is the authoritative
// settlement path even if the customer never returns to the site.
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!isValidWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    event: string;
    data: { reference: string };
  };

  if (event.event === "charge.success") {
    try {
      await finalizeOrderPayment(event.data.reference);
    } catch (error) {
      console.error("Failed to finalize order from webhook", error);
      // Return 200 anyway for unknown/foreign references so Paystack doesn't
      // retry indefinitely; genuine failures are visible in server logs.
    }
  }

  return NextResponse.json({ received: true });
}
