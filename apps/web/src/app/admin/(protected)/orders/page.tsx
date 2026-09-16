import Link from "next/link";

import { getAdminOrders, type OrderListFilter } from "@/lib/admin/orders/queries";
import { formatNaira } from "@/lib/utils";

const FILTERS: { value: OrderListFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "processing", label: "Processing" },
  { value: "ready_for_pickup", label: "Ready for pickup" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: OrderListFilter; q?: string }>;
}) {
  const params = await searchParams;
  const filter = params.filter ?? "all";
  const orders = await getAdminOrders({ filter, q: params.q });

  return (
    <div>
      <h1 className="font-editorial text-2xl">Orders</h1>

      <form className="mt-4" action="/admin/orders">
        <input type="hidden" name="filter" value={filter} />
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Search by order #, name, email, phone"
          className="w-full border border-line px-3 py-2 text-sm outline-none focus:border-ink"
        />
      </form>

      <div className="scrollbar-none mt-3 flex gap-1 overflow-x-auto text-sm">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/admin/orders?filter=${f.value}`}
            className={`shrink-0 rounded-full px-3 py-1.5 ${
              filter === f.value ? "bg-ink text-ivory" : "text-ink-soft hover:bg-ivory"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="mt-4 divide-y divide-line border-y border-line">
        {orders.length === 0 && <p className="py-6 text-sm text-ink-soft">No orders here.</p>}
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="flex items-center justify-between py-3 text-sm"
          >
            <div>
              <p className="text-ink">{order.orderNumber}</p>
              <p className="text-ink-soft">{order.customerName}</p>
            </div>
            <div className="text-right">
              <p className="text-ink">{formatNaira(Number(order.total))}</p>
              <p className="text-xs text-ink-soft">
                {order.paymentStatus} · {order.fulfilmentStatus.replace(/_/g, " ")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
