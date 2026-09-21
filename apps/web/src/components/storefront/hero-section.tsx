import Image from "next/image";
import Link from "next/link";

import heroImage from "@/assets/hero.jpg";

/**
 * Full-width photo background. The source is a portrait studio shot, so it is
 * zoomed in a little and anchored near her face. On phones it fills the hero;
 * on desktop it fills the right-hand ~3/4 and fades into the matching backdrop
 * colour on the left, so the copy sits on plain backdrop and never covers her.
 */
export function HeroSection() {
  return (
    <section className="relative h-[80svh] min-h-[540px] max-h-[760px] w-full overflow-hidden bg-hero-bg">
      <div className="absolute inset-0 origin-[50%_22%] scale-[1.15] md:left-[26%] md:origin-[50%_10%] md:scale-[1.1]">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="object-cover object-[center_12%] md:object-[center_6%]"
        />
        {/* Desktop: the photo starts partway across, so fade its left edge into
            the matching backdrop colour and it reads as one continuous background. */}
        <div className="absolute inset-y-0 left-0 hidden w-1/3 bg-linear-to-r from-hero-bg to-transparent md:block" />
      </div>
      <div className="absolute inset-0 bg-black/30 md:hidden" />
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent md:bg-linear-to-r md:from-black/45 md:via-transparent md:to-transparent" />

      <div className="store-container relative flex h-full flex-col items-center justify-end pb-12 text-center md:items-start md:justify-center md:pb-0 md:text-left">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand">
          Bee Hairplace
        </p>
        <h1 className="mt-3 max-w-2xl font-heading text-4xl font-bold leading-tight text-white md:max-w-xl md:text-5xl md:leading-[1.15]">
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
