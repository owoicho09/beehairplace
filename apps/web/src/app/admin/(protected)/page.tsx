import Link from "next/link";
import { count, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { orders, productMedia } from "@/lib/db/schema";

export default async function AdminOverviewPage() {
  const [[{ pendingCount }], [{ processingCount }], [{ failedCount }], recentOrders] =
    await Promise.all([
      db
        .select({ pendingCount: count() })
        .from(orders)
        .where(eq(orders.fulfilmentStatus, "processing")),
      db
        .select({ processingCount: count() })
        .from(productMedia)
        .where(eq(productMedia.status, "processing")),
      db
        .select({ failedCount: count() })
        .from(productMedia)
        .where(eq(productMedia.status, "failed")),
      db.query.orders.findMany({
        orderBy: (o, { desc }) => desc(o.createdAt),
        limit: 8,
      }),
    ]);

  return (
    <div>
      <h1 className="font-editorial text-2xl">Overview</h1>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <StatCard label="Orders to process" value={pendingCount} />
        <StatCard label="Media processing" value={processingCount} />
        <StatCard label="Media failed" value={failedCount} tone={failedCount > 0 ? "warn" : undefined} />
      </div>

      <h2 className="mt-8 font-editorial text-lg">Recent orders</h2>
      <div className="mt-3 divide-y divide-line border-y border-line">
        {recentOrders.length === 0 && (
          <p className="py-4 text-sm text-ink-soft">No orders yet.</p>
        )}
        {recentOrders.map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="flex items-center justify-between py-3 text-sm"
          >
            <div>
              <p className="text-ink">{order.orderNumber}</p>
              <p className="text-ink-soft">{order.customerName}</p>
            </div>
            <span className="text-ink-soft">{order.fulfilmentStatus}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "warn";
}) {
  return (
    <div className="border border-line bg-ivory p-4">
      <p className={`text-2xl ${tone === "warn" && value > 0 ? "text-burgundy" : "text-ink"}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-ink-soft">{label}</p>
    </div>
  );
}
