import Image from "next/image";
import Link from "next/link";

import newArrivalImage from "@/assets/new-arrival.jpg";

/**
 * Landscape lifestyle banner. The photo is a portrait frame of a model posed
 * sideways, so it is never rotated or stretched: the image sits in an
 * over-sized, absolutely positioned wrapper (same aspect as the photo) that is
 * offset so her face lands right of centre, with the sweep of blonde hair
 * running across the top and the hand/bracelet beside her face. That matches
 * the reference crop. Offsets are % of the banner, so the framing holds at
 * every width; the banner aspect is fixed per breakpoint.
 */
export function NewArrivalBanner() {
  return (
    <section className="store-container py-6 md:py-8">
      <div className="relative flex aspect-[6/5] items-end justify-center overflow-hidden bg-hero-bg md:aspect-[2.8/1] md:items-center md:justify-start">
        <div className="absolute -left-[4.7%] -top-[1.7%] aspect-[1016/1265] w-[119%] md:-left-[11%] md:-top-[35%] md:w-[130%]">
          <Image
            src={newArrivalImage}
            alt=""
            fill
            placeholder="blur"
            sizes="(max-width: 768px) 120vw, 1500px"
            className="object-cover"
          />
        </div>
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
