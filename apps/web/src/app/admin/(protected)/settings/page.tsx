import { StoreSettingsForm } from "@/components/admin/store-settings-form";
import { getStoreSettings } from "@/lib/catalog/queries";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="max-w-md">
      <h1 className="font-editorial text-2xl">Store settings</h1>
      <div className="mt-6">
        <StoreSettingsForm
          defaultValues={{
            storeName: settings?.storeName ?? "Bee Hairplace",
            address: settings?.address ?? "",
            phone: settings?.phone ?? "",
            whatsappNumber: settings?.whatsappNumber ?? "",
            openingHours: settings?.openingHours ?? "",
          }}
        />
      </div>
    </div>
  );
}
