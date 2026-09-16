import { CategoriesManager } from "@/components/admin/categories-manager";
import { getCategories } from "@/lib/catalog/queries";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-md">
      <h1 className="font-editorial text-2xl">Categories</h1>
      <div className="mt-6">
        <CategoriesManager initialCategories={categories} />
      </div>
    </div>
  );
}
