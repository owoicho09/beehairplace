import Image from "next/image";
import Link from "next/link";

export type CategoryCardData = {
  slug: string;
  name: string;
  posterUrl: string | null;
};

export function CategoryCards({ categories }: { categories: CategoryCardData[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="store-container py-12 md:py-16">
      <h2 className="text-center font-heading text-2xl font-bold md:text-3xl">
        Categories
      </h2>
      <div className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/shop?category=${category.slug}`}
            className="group relative block aspect-[3/5] w-[calc(50%-0.375rem)] overflow-hidden bg-store-footer sm:w-[calc(50%-0.5rem)] md:aspect-[3/2] md:w-[calc(33.333%-0.667rem)]"
          >
            {category.posterUrl && (
              <Image
                src={category.posterUrl}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, 370px"
                className="object-cover object-[center_45%] transition-transform duration-300 group-hover:scale-[1.03]"
              />
            )}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/60 to-transparent" />
            <span className="absolute bottom-3 left-3 right-3 font-heading text-base font-bold leading-tight text-white md:bottom-4 md:left-4 md:text-lg">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
