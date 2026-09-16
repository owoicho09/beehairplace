import { ProductForm } from "@/components/admin/product-form";
import { getCategories } from "@/lib/catalog/queries";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="font-editorial text-2xl">New product</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Save the basics first — you&apos;ll add the video on the next screen.
      </p>
      <div className="mt-6 max-w-lg">
        <ProductForm
          categories={categories}
          defaultValues={{
            name: "",
            categoryId: null,
            description: "",
            hasVariants: false,
            basePrice: null,
            variants: [],
            availability: "in_stock",
            publishStatus: "draft",
            isFeatured: false,
            isBestSeller: false,
          }}
        />
      </div>
    </div>
  );
}
