"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import {
  createCategoryInline,
  createProduct,
  updateProduct,
  type ProductInput,
} from "@/lib/admin/products/actions";

export type ProductFormCategory = { id: string; name: string };

export function ProductForm({
  productId,
  categories,
  defaultValues,
}: {
  productId?: string;
  categories: ProductFormCategory[];
  defaultValues: ProductInput;
}) {
  const router = useRouter();
  const [categoryOptions, setCategoryOptions] = useState(categories);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, watch, setValue } = useForm<ProductInput>({
    defaultValues,
  });

  const hasVariants = watch("hasVariants");
  const { fields, append, remove } = useFieldArray({ control, name: "variants" });

  async function addCategory() {
    if (!newCategoryName.trim()) return;
    const category = await createCategoryInline(newCategoryName.trim());
    if (category) {
      setCategoryOptions((prev) => [...prev, { id: category.id, name: category.name }]);
      setValue("categoryId", category.id);
      setNewCategoryName("");
    }
  }

  async function onSubmit(values: ProductInput) {
    setError(null);
    setIsSubmitting(true);
    try {
      if (productId) {
        const result = await updateProduct(productId, values);
        if (!result.ok) {
          setError(result.error);
          setIsSubmitting(false);
          return;
        }
        router.refresh();
      } else {
        await createProduct(values);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="text-sm text-ink-soft">Name</label>
        <input
          {...register("name", { required: true })}
          className="mt-1 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>

      <div>
        <label className="text-sm text-ink-soft">Category</label>
        <select
          {...register("categoryId")}
          className="mt-1 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
        >
          <option value="">No category</option>
          {categoryOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="mt-2 flex gap-2">
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category name"
            className="flex-1 border border-line px-3 py-2 text-sm outline-none focus:border-ink"
          />
          <button
            type="button"
            onClick={addCategory}
            className="border border-line px-3 py-2 text-sm"
          >
            Add
          </button>
        </div>
      </div>

      <div>
        <label className="text-sm text-ink-soft">Description</label>
        <textarea
          {...register("description")}
          rows={4}
          className="mt-1 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" {...register("hasVariants")} />
          This product has different prices per length/option
        </label>
      </div>

      {hasVariants ? (
        <div className="space-y-3">
          <label className="text-sm text-ink-soft">Length / option pricing</label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <input
                {...register(`variants.${index}.label` as const)}
                placeholder="e.g. 16 inch"
                className="flex-1 border border-line px-3 py-2 text-sm outline-none focus:border-ink"
              />
              <input
                type="number"
                step="0.01"
                {...register(`variants.${index}.price` as const)}
                placeholder="Price"
                className="w-28 border border-line px-3 py-2 text-sm outline-none focus:border-ink"
              />
              <select
                {...register(`variants.${index}.availability` as const)}
                className="border border-line px-2 py-2 text-sm"
              >
                <option value="in_stock">In stock</option>
                <option value="out_of_stock">Out of stock</option>
              </select>
              <button type="button" onClick={() => remove(index)} className="text-warm-grey">
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ label: "", price: 0, availability: "in_stock" })}
            className="border border-line px-3 py-1.5 text-sm"
          >
            Add option
          </button>
        </div>
      ) : (
        <div>
          <label className="text-sm text-ink-soft">Price</label>
          <input
            type="number"
            step="0.01"
            placeholder="Leave blank if not decided yet"
            {...register("basePrice")}
            className="mt-1 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
          />
          <p className="mt-1 text-xs text-warm-grey">
            Can be added later — a price is only required before publishing.
          </p>
        </div>
      )}

      {!hasVariants && (
        <div>
          <label className="text-sm text-ink-soft">Availability</label>
          <select
            {...register("availability")}
            className="mt-1 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
          >
            <option value="in_stock">In stock</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
        </div>
      )}

      {productId && (
        <>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input type="checkbox" {...register("isFeatured")} />
              Featured on homepage
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input type="checkbox" {...register("isBestSeller")} />
              Best seller
            </label>
          </div>

          <div>
            <label className="text-sm text-ink-soft">Publishing</label>
            <select
              {...register("publishStatus")}
              className="mt-1 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
            >
              <option value="draft">Draft (hidden from customers)</option>
              <option value="published">Published</option>
            </select>
          </div>
        </>
      )}

      {error && <p className="text-sm text-burgundy">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-ink py-3 text-sm font-medium text-ivory disabled:opacity-50"
      >
        {isSubmitting ? "Saving…" : productId ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}
