"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useCartStore } from "@/lib/cart/store";
import { finalizeOrder, submitCheckout } from "@/lib/orders/actions";
import { formatNaira } from "@/lib/utils";

const formSchema = z
  .object({
    customerName: z.string().trim().min(2, "Enter your full name"),
    email: z.string().trim().email("Enter a valid email"),
    phone: z.string().trim().min(7, "Enter a valid phone number"),
    fulfilmentMethod: z.enum(["delivery", "pickup"]),
    address: z.string().trim().optional(),
    city: z.string().trim().optional(),
    zone: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  })
  .refine(
    (data) =>
      data.fulfilmentMethod === "pickup" ||
      (data.address && data.address.length >= 5),
    { message: "Enter your delivery address", path: ["address"] },
  );

type FormValues = z.infer<typeof formSchema>;

export function CheckoutForm({
  deliveryFlatFee,
  deliveryFreeThreshold,
  deliveryZones,
}: {
  deliveryFlatFee: number;
  deliveryFreeThreshold: number | null;
  deliveryZones: { zone: string; fee: number }[];
}) {
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { fulfilmentMethod: "delivery" },
  });

  const fulfilmentMethod = watch("fulfilmentMethod");
  const zone = watch("zone");

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const estimatedDeliveryFee = useMemo(() => {
    if (fulfilmentMethod === "pickup") return 0;
    if (deliveryFreeThreshold !== null && subtotal >= deliveryFreeThreshold) {
      return 0;
    }
    const zoneMatch = deliveryZones.find((z) => z.zone === zone);
    return zoneMatch ? zoneMatch.fee : deliveryFlatFee;
  }, [fulfilmentMethod, zone, subtotal, deliveryFlatFee, deliveryFreeThreshold, deliveryZones]);

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    setIsSubmitting(true);

    const result = await submitCheckout({
      customerName: values.customerName,
      email: values.email,
      phone: values.phone,
      fulfilmentMethod: values.fulfilmentMethod,
      deliveryAddress:
        values.fulfilmentMethod === "delivery"
          ? {
              address: values.address ?? "",
              city: values.city,
              zone: values.zone,
              notes: values.notes,
            }
          : null,
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
    });

    if (!result.ok) {
      setSubmitError(result.error);
      setIsSubmitting(false);
      return;
    }

    const orderNumber = result.orderNumber;
    const { default: PaystackPop } = await import("@paystack/inline-js");
    const popup = new PaystackPop();

    popup.resumeTransaction(result.accessCode, {
      onSuccess: async (response: { reference: string }) => {
        // The popup reports success, but we still re-verify server-side
        // (finalizeOrder calls Paystack's Verify API) before trusting it.
        await finalizeOrder(response.reference);
        clear();
        router.push(`/order/${orderNumber}`);
      },
      onCancel: () => {
        // Leave the order as pending (a normal, expected state) and let the
        // customer retry from this same screen rather than navigating them
        // to a page for a payment that never completed.
        setIsSubmitting(false);
        setSubmitError("Payment was not completed. You can try again.");
      },
    });
  }

  return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="text-sm text-ink-soft">Full name</label>
          <input
            {...register("customerName")}
            className="mt-1 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
          />
          {errors.customerName && (
            <p className="mt-1 text-xs text-burgundy">{errors.customerName.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm text-ink-soft">Email</label>
          <input
            type="email"
            {...register("email")}
            className="mt-1 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-burgundy">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm text-ink-soft">Phone / WhatsApp</label>
          <input
            type="tel"
            {...register("phone")}
            className="mt-1 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-burgundy">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <p className="text-sm text-ink-soft">Fulfilment</p>
          <div className="mt-2 flex gap-2">
            <label
              className={`flex-1 cursor-pointer border px-4 py-2.5 text-center text-sm ${
                fulfilmentMethod === "delivery" ? "border-ink bg-ink text-ivory" : "border-line"
              }`}
            >
              <input
                type="radio"
                value="delivery"
                {...register("fulfilmentMethod")}
                className="hidden"
              />
              Delivery
            </label>
            <label
              className={`flex-1 cursor-pointer border px-4 py-2.5 text-center text-sm ${
                fulfilmentMethod === "pickup" ? "border-ink bg-ink text-ivory" : "border-line"
              }`}
            >
              <input
                type="radio"
                value="pickup"
                {...register("fulfilmentMethod")}
                className="hidden"
              />
              Pickup in Abuja
            </label>
          </div>
        </div>

        {fulfilmentMethod === "delivery" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-ink-soft">Delivery address</label>
              <textarea
                {...register("address")}
                rows={2}
                className="mt-1 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
              />
              {errors.address && (
                <p className="mt-1 text-xs text-burgundy">{errors.address.message}</p>
              )}
            </div>
            {deliveryZones.length > 0 && (
              <div>
                <label className="text-sm text-ink-soft">Zone</label>
                <select
                  {...register("zone")}
                  className="mt-1 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
                >
                  <option value="">Standard</option>
                  {deliveryZones.map((z) => (
                    <option key={z.zone} value={z.zone}>
                      {z.zone}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="text-sm text-ink-soft">Notes (optional)</label>
              <input
                {...register("notes")}
                className="mt-1 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
              />
            </div>
          </div>
        )}

        <div className="border-t border-line pt-4 text-sm">
          <div className="flex justify-between text-ink-soft">
            <span>Subtotal</span>
            <span>{formatNaira(subtotal)}</span>
          </div>
          <div className="mt-1 flex justify-between text-ink-soft">
            <span>{fulfilmentMethod === "pickup" ? "Pickup" : "Delivery"}</span>
            <span>{estimatedDeliveryFee === 0 ? "Free" : formatNaira(estimatedDeliveryFee)}</span>
          </div>
          <div className="mt-2 flex justify-between text-base text-ink">
            <span>Total</span>
            <span>{formatNaira(subtotal + estimatedDeliveryFee)}</span>
          </div>
        </div>

        {submitError && <p className="text-sm text-burgundy">{submitError}</p>}

        <button
          type="submit"
          disabled={isSubmitting || items.length === 0}
          className="w-full bg-ink py-3.5 text-sm font-medium text-ivory transition-colors hover:bg-ink-soft disabled:opacity-50"
        >
          {isSubmitting ? "Processing…" : "Pay now"}
        </button>
      </form>
  );
}
