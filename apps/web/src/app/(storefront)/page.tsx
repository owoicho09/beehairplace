import { FeaturedSection } from "@/components/storefront/featured-section";
import { HeroSection } from "@/components/storefront/hero-section";
import { StoreSection } from "@/components/storefront/store-section";
import {
  getBestSellers,
  getFeaturedProducts,
  getStoreSettings,
} from "@/lib/catalog/queries";

export const revalidate = 300;

export default async function HomePage() {
  const [settings, featured, bestSellers] = await Promise.all([
    getStoreSettings(),
    getFeaturedProducts(),
    getBestSellers(),
  ]);

  return (
    <>
      <HeroSection
        videoUrl={settings?.heroMedia?.processedUrl ?? null}
        posterUrl={settings?.heroMedia?.posterUrl ?? null}
      />

      <FeaturedSection
        title="New in"
        viewAllHref="/shop"
        products={featured.map((p) => ({
          slug: p.slug,
          name: p.name,
          startingPrice: p.startingPrice,
          hasVariants: p.hasVariants,
          posterUrl: p.posterUrl,
          videoUrl: p.videoUrl,
        }))}
      />

      <FeaturedSection
        title="Best sellers"
        viewAllHref="/shop"
        products={bestSellers.map((p) => ({
          slug: p.slug,
          name: p.name,
          startingPrice: p.startingPrice,
          hasVariants: p.hasVariants,
          posterUrl: p.posterUrl,
          // Posters only: autoplay is reserved for the small "New in" set
          // above, so the homepage stays bandwidth-disciplined on mobile.
          videoUrl: null,
        }))}
      />

      <StoreSection
        videoUrl={settings?.storeVideoMedia?.processedUrl ?? null}
        posterUrl={settings?.storeVideoMedia?.posterUrl ?? null}
        address={settings?.address ?? null}
        openingHours={settings?.openingHours ?? null}
        whatsappNumber={settings?.whatsappNumber ?? null}
      />
    </>
  );
}
