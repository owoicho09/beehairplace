import { getStoreSettings } from "@/lib/catalog/queries";

export async function StorefrontFooter() {
  const settings = await getStoreSettings();

  return (
    <footer className="border-t border-line bg-ivory-dim">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-ink-soft">
        <p className="font-editorial text-base text-ink">Bee Hairplace</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {settings?.address && <p>{settings.address}</p>}
          {settings?.phone && <p>{settings.phone}</p>}
          {settings?.openingHours && <p>{settings.openingHours}</p>}
        </div>
        <p className="mt-8 text-xs text-warm-grey">
          © {new Date().getFullYear()} Bee Hairplace. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
