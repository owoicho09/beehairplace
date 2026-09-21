import Image from "next/image";
import Link from "next/link";

import newArrivalMobile from "@/assets/new-arrival-mobile.jpg";
import newArrivalWide from "@/assets/new-arrival-wide.jpg";

/**
 * The photo shows the model reclining across the frame (a landscape shot), so
 * that is how it is presented: she lies horizontally at every size.
 *
 * Both files are the same photo in that orientation with the studio backdrop
 * extended so the copy has plain wall to sit on instead of covering her:
 *  - desktop: extended to the left, copy on the left, she reclines on the right
 *  - phones: extended upward, copy on the wall above, she reclines below it
 * Only the visible one loads (the other is `display: none` + lazy).
 */
export function NewArrivalBanner() {
  return (
    <section className="store-container py-6 md:py-8">
      <div className="relative flex aspect-square items-start justify-center overflow-hidden bg-hero-bg md:aspect-[2.4/1] md:items-center md:justify-start">
        <Image
          src={newArrivalMobile}
          alt=""
          fill
          placeholder="blur"
          sizes="(max-width: 768px) 100vw, 1px"
          className="object-cover md:hidden"
        />
        <Image
          src={newArrivalWide}
          alt=""
          fill
          placeholder="blur"
          sizes="(min-width: 1140px) 1092px, 100vw"
          className="hidden object-cover object-[center_100%] md:block"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/35 via-transparent to-transparent md:bg-linear-to-r md:from-black/40 md:via-transparent md:to-transparent" />
        <div className="relative px-6 pt-6 text-center text-white md:px-12 md:pt-0 md:text-left">
          <h2 className="font-heading text-2xl font-bold leading-tight md:text-5xl">
            New Arrival
            <br />
            Collection
          </h2>
          <p className="mt-2 text-sm md:mt-3 md:text-base">
            The latest styles, freshly added.
          </p>
          <Link
            href="/shop?sort=newest"
            className="mt-4 inline-flex items-center bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-dark md:mt-6"
          >
            Explore now
          </Link>
        </div>
      </div>
    </section>
  );
}
