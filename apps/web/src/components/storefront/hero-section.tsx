import Link from "next/link";

export function HeroSection({
  videoUrl,
  posterUrl,
}: {
  videoUrl: string | null;
  posterUrl: string | null;
}) {
  return (
    <section className="relative h-[85vh] min-h-[520px] w-full overflow-hidden bg-ink">
      {videoUrl && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={videoUrl}
          poster={posterUrl ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
      <div className="relative flex h-full flex-col items-start justify-end px-5 pb-14 sm:px-10">
        <h1 className="font-editorial text-4xl italic text-ivory sm:text-6xl">
          Find your next look.
        </h1>
        <p className="mt-2 max-w-sm text-sm text-ivory/90 sm:text-base">
          Premium human hair in styles, textures and lengths made for your look.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center bg-ivory px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-ivory/90"
        >
          Shop the collection
        </Link>
      </div>
    </section>
  );
}
