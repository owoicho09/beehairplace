import { CategoryCards } from "@/components/storefront/category-cards";
import { HeroSection } from "@/components/storefront/hero-section";
import { NewArrivalBanner } from "@/components/storefront/new-arrival-banner";
import { ProductSection } from "@/components/storefront/product-section";
import { WhyChooseUs } from "@/components/storefront/why-choose-us";
import {
  getBestSellers,
  getCategoryCards,
  getFeaturedProducts,
  getNewArrival,
  getStoreSettings,
} from "@/lib/catalog/queries";

export const revalidate = 300;

export default async function HomePage() {
  const [settings, categories, featured, newArrival, trending] =
    await Promise.all([
      getStoreSettings(),
      getCategoryCards(),
      getFeaturedProducts(),
      getNewArrival(),
      getBestSellers(),
    ]);

  return (
    <>
      <HeroSection
        videoUrl={settings?.heroMedia?.processedUrl ?? null}
        posterUrl={settings?.heroMedia?.posterUrl ?? null}
      />
      <WhyChooseUs />
      <CategoryCards categories={categories} />
      <ProductSection
        centered
        title="Featured Products"
        subtitle="Check out the latest updates"
        products={featured}
        href="/shop"
        linkLabel="View All"
      />
      <NewArrivalBanner posterUrl={newArrival?.posterUrl ?? null} />
      <ProductSection
        title="Trending Now"
        products={trending}
        href="/shop"
        linkLabel="Browse Shop"
      />
    </>
  );
}
