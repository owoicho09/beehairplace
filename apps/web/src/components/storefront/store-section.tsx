export function StoreSection({
  address,
  openingHours,
}: {
  address: string | null;
  openingHours: string | null;
}) {
  if (!address && !openingHours) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="font-editorial text-2xl">Visit us in Abuja</h2>
      <p className="mt-3 max-w-lg text-sm text-ink-soft">
        Prefer to see it in person? Stop by, or order online for delivery.
      </p>
      {address && <p className="mt-3 text-sm text-ink-soft">{address}</p>}
      {openingHours && <p className="mt-1 text-sm text-ink-soft">{openingHours}</p>}
    </section>
  );
}
