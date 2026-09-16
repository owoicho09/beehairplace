import { CheckoutForm } from "@/components/storefront/checkout-form";
import { getDeliverySettings } from "@/lib/catalog/queries";

export default async function CheckoutPage() {
  const settings = await getDeliverySettings();

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-editorial text-2xl">Checkout</h1>
      <div className="mt-6">
        <CheckoutForm
          deliveryFlatFee={settings ? Number(settings.flatFee) : 0}
          deliveryFreeThreshold={
            settings?.freeDeliveryThreshold
              ? Number(settings.freeDeliveryThreshold)
              : null
          }
          deliveryZones={settings?.zoneFees ?? []}
        />
      </div>
    </div>
  );
}
