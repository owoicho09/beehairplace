import Link from "next/link";
import { notFound } from "next/navigation";

import { finalizeOrderPayment } from "@/lib/orders/finalize";
import { getOrderByNumber } from "@/lib/orders/queries";
import { formatNaira } from "@/lib/utils";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference: orderNumber } = await params;
  let order = await getOrderByNumber(orderNumber);

  if (!order) notFound();

  // If the customer landed here via Paystack's redirect callback before the
  // popup's onSuccess or the webhook fired, make one server-side attempt to
  // confirm payment now rather than showing a stale "pending" state.
  if (order.paymentStatus === "pending") {
    try {
      await finalizeOrderPayment(order.paystackReference);
      order = await getOrderByNumber(orderNumber);
    } catch {
      // Leave as pending; the webhook will still settle this shortly.
    }
  }

  if (!order) notFound();

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 md:py-16">
      <div className="text-center">
        {order.paymentStatus === "paid" ? (
          <>
            <h1 className="font-heading text-3xl font-bold">
              Thank you, {order.customerName.split(" ")[0]}.
            </h1>
            <p className="mt-3 text-sm text-store-muted">
              Your order{" "}
              <span className="font-medium text-store-ink">
                {order.orderNumber}
              </span>{" "}
              is confirmed.
            </p>
          </>
        ) : order.paymentStatus === "failed" ? (
          <>
            <h1 className="font-heading text-3xl font-bold">
              Payment not completed
            </h1>
            <p className="mt-3 text-sm text-store-muted">
              Order {order.orderNumber} is saved, but payment didn&apos;t go
              through. Please contact us on WhatsApp to complete your purchase.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-heading text-3xl font-bold">
              Confirming your payment…
            </h1>
            <p className="mt-3 text-sm text-store-muted">
              Order {order.orderNumber} is being confirmed. This page will
              update shortly, or refresh in a moment.
            </p>
          </>
        )}
      </div>

      <div className="mt-10 divide-y divide-store-line border-y border-store-line">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between gap-4 py-4 text-sm">
            <div>
              <p className="font-heading font-bold text-store-ink">
                {item.productNameSnapshot}
              </p>
              {item.variantLabelSnapshot && (
                <p className="mt-1 text-store-muted">
                  {item.variantLabelSnapshot}
                </p>
              )}
              <p className="mt-1 text-store-muted">Qty {item.quantity}</p>
            </div>
            <p className="shrink-0 text-store-ink">
              {formatNaira(Number(item.unitPriceSnapshot) * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between text-sm text-store-muted">
        <span>Delivery</span>
        <span>{formatNaira(Number(order.deliveryFee))}</span>
      </div>
      <div className="mt-2 flex justify-between text-base font-bold text-store-ink">
        <span>Total</span>
        <span>{formatNaira(Number(order.total))}</span>
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/shop"
          className="inline-flex bg-store-tint px-6 py-3 text-sm font-medium text-store-ink transition-colors hover:bg-brand hover:text-white"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
