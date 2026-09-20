import Image from "next/image";
import Link from "next/link";

export function NewArrivalBanner({
  posterUrl,
}: {
  posterUrl: string | null;
}) {
  if (!posterUrl) return null;

  return (
    <section className="store-container py-6 md:py-8">
      <div className="relative flex aspect-[8/7] items-center justify-center overflow-hidden bg-store-footer md:aspect-[2.8/1] md:justify-start">
        {/* Product posters are portrait video frames, so on desktop the image
            sits in a right-hand panel near its native size instead of being
            blown up to the full banner width. */}
        <div className="absolute inset-0 md:left-auto md:w-[42%]">
          <Image
            src={posterUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 480px"
            className="object-cover object-[center_70%] md:object-[center_40%]"
          />
          <div className="absolute inset-0 bg-black/55 md:hidden" />
          <div className="absolute inset-y-0 left-0 hidden w-2/5 bg-linear-to-r from-store-footer to-transparent md:block" />
        </div>
        <div className="relative px-6 text-center text-white md:px-12 md:text-left">
          <h2 className="font-heading text-3xl font-bold leading-tight md:text-5xl">
            New Arrival
            <br />
            Collection
          </h2>
          <p className="mt-3 text-sm md:text-base">
            The latest styles, freshly added.
          </p>
          <Link
            href="/shop?sort=newest"
            className="mt-6 inline-flex items-center bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
          >
            Explore now
          </Link>
        </div>
      </div>
    </section>
  );
}
