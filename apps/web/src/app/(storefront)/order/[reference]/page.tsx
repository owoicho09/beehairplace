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
    <div className="mx-auto max-w-lg px-4 py-10">
      {order.paymentStatus === "paid" ? (
        <>
          <h1 className="font-editorial text-2xl">Thank you, {order.customerName.split(" ")[0]}.</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Your order <span className="text-ink">{order.orderNumber}</span> is confirmed.
          </p>
        </>
      ) : order.paymentStatus === "failed" ? (
        <>
          <h1 className="font-editorial text-2xl">Payment not completed</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Order {order.orderNumber} is saved, but payment didn&apos;t go through.
            Please contact us on WhatsApp to complete your purchase.
          </p>
        </>
      ) : (
        <>
          <h1 className="font-editorial text-2xl">Confirming your payment…</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Order {order.orderNumber} is being confirmed. This page will
            update shortly, or refresh in a moment.
          </p>
        </>
      )}

      <div className="mt-8 divide-y divide-line border-y border-line">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between py-3 text-sm">
            <div>
              <p className="text-ink">{item.productNameSnapshot}</p>
              {item.variantLabelSnapshot && (
                <p className="text-ink-soft">{item.variantLabelSnapshot}</p>
              )}
              <p className="text-ink-soft">Qty {item.quantity}</p>
            </div>
            <p className="text-ink">
              {formatNaira(Number(item.unitPriceSnapshot) * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between text-sm text-ink-soft">
        <span>Delivery</span>
        <span>{formatNaira(Number(order.deliveryFee))}</span>
      </div>
      <div className="mt-1 flex justify-between text-base text-ink">
        <span>Total</span>
        <span>{formatNaira(Number(order.total))}</span>
      </div>
    </div>
  );
}
