"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  createCategory,
  deleteCategory,
  renameCategory,
  reorderCategories,
} from "@/lib/admin/categories/actions";

export type CategoryRow = { id: string; name: string };

export function CategoriesManager({ initialCategories }: { initialCategories: CategoryRow[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!newName.trim()) return;
    await createCategory(newName.trim());
    setNewName("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    const result = await deleteCategory(id);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...categories];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setCategories(next);
    reorderCategories(next.map((c) => c.id));
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="flex-1 border border-line px-3 py-2 text-sm outline-none focus:border-ink"
        />
        <button type="button" onClick={handleCreate} className="bg-ink px-4 py-2 text-sm text-ivory">
          Add
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-burgundy">{error}</p>}

      <div className="mt-4 divide-y divide-line border-y border-line">
        {categories.map((category, index) => (
          <div key={category.id} className="flex items-center gap-2 py-2.5">
            <input
              defaultValue={category.name}
              onBlur={(e) => {
                if (e.target.value.trim() && e.target.value !== category.name) {
                  renameCategory(category.id, e.target.value.trim());
                  router.refresh();
                }
              }}
              className="flex-1 border border-transparent bg-transparent px-1 py-1 text-sm outline-none focus:border-line"
            />
            <button type="button" onClick={() => move(index, -1)} className="text-ink-soft">
              ↑
            </button>
            <button type="button" onClick={() => move(index, 1)} className="text-ink-soft">
              ↓
            </button>
            <button
              type="button"
              onClick={() => handleDelete(category.id)}
              className="text-xs text-burgundy underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
