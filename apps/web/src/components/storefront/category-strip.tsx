import Link from "next/link";

export function CategoryStrip({
  categories,
}: {
  categories: { slug: string; name: string }[];
}) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="text-xs font-medium uppercase tracking-wide text-warm-grey">
        Shop the collection
      </h2>
      <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/shop?category=${category.slug}`}
            className="shrink-0 whitespace-nowrap rounded-full border border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
