import { DeliverySettingsForm } from "@/components/admin/delivery-settings-form";
import { getDeliverySettings } from "@/lib/catalog/queries";

export default async function AdminDeliveryPage() {
  const settings = await getDeliverySettings();

  return (
    <div className="max-w-md">
      <h1 className="font-editorial text-2xl">Delivery</h1>
      <div className="mt-6">
        <DeliverySettingsForm
          defaultValues={{
            flatFee: settings ? Number(settings.flatFee) : 0,
            freeDeliveryThreshold: settings?.freeDeliveryThreshold
              ? Number(settings.freeDeliveryThreshold)
              : null,
            zoneFees: settings?.zoneFees ?? [],
          }}
        />
      </div>
    </div>
  );
}
