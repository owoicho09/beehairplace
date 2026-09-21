import Image from "next/image";
import Link from "next/link";

import heroImage from "@/assets/hero.jpg";

/**
 * The hero photo is a portrait studio shot, so on desktop it sits in a
 * right-hand panel at close to native size and fades into the matching brown
 * backdrop (`bg-hero-bg`) instead of being blown up to full width. On phones
 * it fills the section and the copy sits at the bottom, clear of her face.
 */
export function HeroSection() {
  return (
    <section className="relative h-[80svh] min-h-[540px] max-h-[760px] w-full overflow-hidden bg-hero-bg">
      <div className="absolute inset-0 md:left-auto md:w-[55%]">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="(max-width: 768px) 100vw, 55vw"
          className="object-cover object-[center_10%]"
        />
        <div className="absolute inset-y-0 left-0 hidden w-1/2 bg-linear-to-r from-hero-bg to-transparent md:block" />
      </div>
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent md:hidden" />

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
