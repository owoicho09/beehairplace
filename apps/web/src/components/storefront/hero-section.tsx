import Link from "next/link";

export function HeroSection({
  videoUrl,
  posterUrl,
}: {
  videoUrl: string | null;
  posterUrl: string | null;
}) {
  return (
    <section className="relative h-[75svh] min-h-[520px] max-h-[760px] w-full overflow-hidden bg-store-footer">
      {videoUrl && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={videoUrl}
          poster={posterUrl ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      )}
      <div className="absolute inset-0 bg-black/45" />
      <div className="store-container relative flex h-full flex-col items-center justify-center text-center md:items-start md:text-left">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand">
          Bee Hairplace
        </p>
        <h1 className="mt-3 max-w-2xl font-heading text-4xl font-bold leading-tight text-white md:text-6xl md:leading-[1.15]">
          Human Hair Wigs, Bundles &amp; Closures
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/90 md:text-base">
          See every piece on video before you buy. Delivery across Abuja or
          pickup in-store.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex items-center bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          Shop Collection
        </Link>
      </div>
    </section>
  );
}
