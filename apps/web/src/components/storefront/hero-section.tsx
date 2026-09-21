import Image from "next/image";
import Link from "next/link";

import heroImage from "@/assets/hero-wide.jpg";

/**
 * One full-bleed background image at every size. `hero-wide.jpg` is the studio
 * photo with its backdrop extended to the left, so she stands right of centre
 * (~70% across) at full resolution and the headline sits on plain backdrop
 * instead of over her. Desktop shows the wide frame (slightly zoomed); phones
 * crop to her with a dark fade at the bottom for the copy.
 */
export function HeroSection() {
  return (
    <section className="relative h-[80svh] min-h-[540px] max-h-[760px] w-full overflow-hidden bg-hero-bg">
      <div className="absolute inset-0 md:origin-[72%_18%] md:scale-[1.1]">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="object-cover object-[88%_12%] md:object-[center_6%]"
        />
      </div>
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent md:bg-linear-to-r md:from-black/30 md:via-transparent md:to-transparent" />

      <div className="store-container relative flex h-full flex-col items-center justify-end pb-12 text-center md:items-start md:justify-center md:pb-0 md:text-left">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand">
          Bee Hairplace
        </p>
        <h1 className="mt-3 max-w-2xl font-heading text-4xl font-bold leading-tight text-white md:max-w-lg md:text-5xl lg:max-w-xl lg:text-6xl lg:leading-[1.15]">
          Human Hair Wigs, Bundles &amp; Closures
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/90 md:max-w-md md:text-base">
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
