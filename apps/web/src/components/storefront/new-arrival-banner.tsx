import Image from "next/image";
import Link from "next/link";

import newArrivalImage from "@/assets/new-arrival.jpg";

/**
 * Full-bleed lifestyle banner. The photo is a portrait frame of a model posed
 * sideways, so the banner stays landscape at every size and the crop is
 * anchored to the top of the image, where her face, blonde hair and tilted pose
 * are. The image is never rotated or stretched; on phones the banner is just a
 * little taller than on desktop so the copy fits below her face.
 */
export function NewArrivalBanner() {
  return (
    <section className="store-container py-6 md:py-8">
      <div className="relative flex aspect-[6/5] items-end justify-center overflow-hidden bg-hero-bg md:aspect-[2.8/1] md:items-center md:justify-start">
        <Image
          src={newArrivalImage}
          alt=""
          fill
          placeholder="blur"
          sizes="(max-width: 1140px) 100vw, 1140px"
          className="object-cover object-[center_top] md:object-[center_4%]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-transparent md:bg-linear-to-r md:from-black/60 md:via-black/20 md:to-transparent" />
        <div className="relative px-6 pb-8 text-center text-white md:px-12 md:pb-0 md:text-left">
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
