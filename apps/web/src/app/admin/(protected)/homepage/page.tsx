import { MerchandisingPicker } from "@/components/admin/merchandising-picker";
import { StoreMediaUpload } from "@/components/admin/store-media-upload";
import { getPublishedProductsForMerchandising } from "@/lib/admin/products/queries";
import { getStoreSettings } from "@/lib/catalog/queries";

export default async function AdminHomepagePage() {
  const [settings, products] = await Promise.all([
    getStoreSettings(),
    getPublishedProductsForMerchandising(),
  ]);

  return (
    <div className="max-w-lg space-y-8">
      <h1 className="font-editorial text-2xl">Homepage</h1>

      <StoreMediaUpload
        target="hero"
        label="Hero video"
        currentPosterUrl={settings?.heroMedia?.posterUrl ?? null}
        currentStatus={settings?.heroMedia?.status ?? null}
      />

      <StoreMediaUpload
        target="store"
        label="Physical store video"
        currentPosterUrl={settings?.storeVideoMedia?.posterUrl ?? null}
        currentStatus={settings?.storeVideoMedia?.status ?? null}
      />

      <div>
        <p className="text-sm font-medium text-ink">Featured &amp; best sellers</p>
        <p className="text-xs text-ink-soft">
          Only published products can be featured or marked as best sellers.
        </p>
        <div className="mt-2">
          <MerchandisingPicker products={products} />
        </div>
      </div>
    </div>
  );
}
