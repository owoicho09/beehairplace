"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { updateFulfilmentStatus } from "@/lib/admin/orders/actions";

type FulfilmentStatus =
  | "processing"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

const LABELS: Record<FulfilmentStatus, string> = {
  processing: "Processing",
  ready_for_pickup: "Ready for pickup",
  out_for_delivery: "Out for delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function OrderStatusControl({
  orderId,
  currentStatus,
  fulfilmentMethod,
}: {
  orderId: string;
  currentStatus: FulfilmentStatus;
  fulfilmentMethod: "delivery" | "pickup";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const nextOptions: Record<FulfilmentStatus, FulfilmentStatus[]> = {
    processing: [fulfilmentMethod === "pickup" ? "ready_for_pickup" : "out_for_delivery", "cancelled"],
    ready_for_pickup: ["completed", "cancelled"],
    out_for_delivery: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
  };

  const options = nextOptions[currentStatus] ?? [];

  return (
    <div>
      <p className="text-sm text-ink-soft">
        Status: <span className="text-ink">{LABELS[currentStatus] ?? currentStatus}</span>
      </p>
      {options.length > 0 && (
        <div className="mt-2 flex gap-2">
          {options.map((status) => (
            <button
              key={status}
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await updateFulfilmentStatus(orderId, status);
                  router.refresh();
                })
              }
              className={`border px-3 py-1.5 text-sm ${
                status === "cancelled" ? "border-burgundy text-burgundy" : "border-ink text-ink"
              }`}
            >
              Mark {LABELS[status]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
