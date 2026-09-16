import { notFound } from "next/navigation";

import { OrderStatusControl } from "@/components/admin/order-status-control";
import { getAdminOrderById } from "@/lib/admin/orders/queries";
import { formatNaira } from "@/lib/utils";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  return (
    <div className="max-w-lg">
      <h1 className="font-editorial text-2xl">{order.orderNumber}</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {order.customerName} · {order.email} · {order.phone}
      </p>

      <div className="mt-4 flex gap-4 text-sm">
        <span>
          Payment:{" "}
          <span className={order.paymentStatus === "paid" ? "text-ink" : "text-burgundy"}>
            {order.paymentStatus}
          </span>
        </span>
        <span>Method: {order.fulfilmentMethod}</span>
      </div>

      <div className="mt-4">
        <OrderStatusControl
          orderId={order.id}
          currentStatus={order.fulfilmentStatus}
          fulfilmentMethod={order.fulfilmentMethod}
        />
      </div>

      {order.fulfilmentMethod === "delivery" && order.deliveryAddress && (
        <div className="mt-4 border border-line bg-ivory p-3 text-sm">
          <p className="text-ink">{order.deliveryAddress.address}</p>
          {order.deliveryAddress.zone && <p className="text-ink-soft">Zone: {order.deliveryAddress.zone}</p>}
          {order.deliveryAddress.notes && <p className="text-ink-soft">{order.deliveryAddress.notes}</p>}
        </div>
      )}

      <div className="mt-6 divide-y divide-line border-y border-line">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between py-3 text-sm">
            <div>
              <p className="text-ink">{item.productNameSnapshot}</p>
              {item.variantLabelSnapshot && (
                <p className="text-ink-soft">{item.variantLabelSnapshot}</p>
              )}
              <p className="text-ink-soft">Qty {item.quantity}</p>
            </div>
            <p className="text-ink">{formatNaira(Number(item.unitPriceSnapshot) * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between text-sm text-ink-soft">
        <span>Delivery fee</span>
        <span>{formatNaira(Number(order.deliveryFee))}</span>
      </div>
      <div className="mt-1 flex justify-between text-base text-ink">
        <span>Total</span>
        <span>{formatNaira(Number(order.total))}</span>
      </div>
    </div>
  );
}
