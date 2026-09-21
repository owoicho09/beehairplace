import { CategoryCards } from "@/components/storefront/category-cards";
import { HeroSection } from "@/components/storefront/hero-section";
import { NewArrivalBanner } from "@/components/storefront/new-arrival-banner";
import { ProductSection } from "@/components/storefront/product-section";
import { WhyChooseUs } from "@/components/storefront/why-choose-us";
import {
  getBestSellers,
  getCategoryCards,
  getFeaturedProducts,
} from "@/lib/catalog/queries";

export const revalidate = 300;

export default async function HomePage() {
  const [categories, featured, trending] = await Promise.all([
    getCategoryCards(),
    getFeaturedProducts(),
    getBestSellers(),
  ]);

  return (
    <>
      <HeroSection />
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
      <NewArrivalBanner />
      <ProductSection
        title="Trending Now"
        products={trending}
        href="/shop"
        linkLabel="Browse Shop"
      />
    </>
  );
}
