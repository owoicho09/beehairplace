"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { slugify } from "@/lib/utils";

export async function createCategory(name: string) {
  await requireAdmin();
  await db.insert(categories).values({ name: name.trim(), slug: slugify(name) });
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}

export async function renameCategory(id: string, name: string) {
  await requireAdmin();
  await db
    .update(categories)
    .set({ name: name.trim(), slug: slugify(name) })
    .where(eq(categories.id, id));
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}

export async function deleteCategory(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    await db.delete(categories).where(eq(categories.id, id));
  } catch {
    return {
      ok: false,
      error: "This category still has products in it. Move or archive them first.",
    };
  }
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  return { ok: true };
}

export async function reorderCategories(orderedIds: string[]) {
  await requireAdmin();
  await Promise.all(
    orderedIds.map((id, index) =>
      db.update(categories).set({ sortOrder: index }).where(eq(categories.id, id)),
    ),
  );
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}
