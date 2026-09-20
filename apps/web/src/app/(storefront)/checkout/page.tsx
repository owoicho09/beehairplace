import { CheckoutForm } from "@/components/storefront/checkout-form";
import { getDeliverySettings } from "@/lib/catalog/queries";

export default async function CheckoutPage() {
  const settings = await getDeliverySettings();

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 md:py-12">
      <h1 className="text-center font-heading text-3xl font-bold md:text-4xl">
        Checkout
      </h1>
      <div className="mt-8">
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
