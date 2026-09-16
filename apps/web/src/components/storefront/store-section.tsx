import { InViewVideo } from "./inview-video";

export function StoreSection({
  videoUrl,
  posterUrl,
  address,
  openingHours,
  whatsappNumber,
}: {
  videoUrl: string | null;
  posterUrl: string | null;
  address: string | null;
  openingHours: string | null;
  whatsappNumber: string | null;
}) {
  if (!videoUrl && !address && !openingHours) return null;

  const directionsHref = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : null;
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^\d]/g, "")}`
    : null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-6 sm:grid-cols-2 sm:items-center">
        {videoUrl && (
          <div className="relative aspect-[4/5] overflow-hidden bg-warm-grey-light sm:order-2">
            <InViewVideo src={videoUrl} poster={posterUrl} className="h-full w-full object-cover" />
          </div>
        )}
        <div className="sm:order-1">
          <p className="text-xs font-medium uppercase tracking-wide text-warm-grey">
            Visit the store
          </p>
          <h2 className="mt-2 font-editorial text-2xl">Come see it in person.</h2>
          <p className="mt-3 max-w-sm text-sm text-ink-soft">
            Visit Bee Hairplace in Abuja to browse the collection in-store, or
            order online for delivery.
          </p>

          {(address || openingHours) && (
            <div className="mt-5 text-sm text-ink-soft">
              {address && <p>{address}</p>}
              {openingHours && <p className="mt-1">{openingHours}</p>}
            </div>
          )}

          {(directionsHref || whatsappHref) && (
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {directionsHref && (
                <a
                  href={directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline underline-offset-4 transition-colors hover:text-ink-soft"
                >
                  Get directions
                </a>
              )}
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline underline-offset-4 transition-colors hover:text-ink-soft"
                >
                  WhatsApp us
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
