"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { deliverySettings, storeSettings } from "@/lib/db/schema";

const deliverySchema = z.object({
  flatFee: z.coerce.number().min(0),
  freeDeliveryThreshold: z.union([z.coerce.number().min(0), z.null()]),
  zoneFees: z.array(z.object({ zone: z.string().trim().min(1), fee: z.coerce.number().min(0) })),
});

export async function updateDeliverySettings(input: z.infer<typeof deliverySchema>) {
  await requireAdmin();
  const data = deliverySchema.parse(input);

  await db
    .insert(deliverySettings)
    .values({
      id: 1,
      flatFee: String(data.flatFee),
      freeDeliveryThreshold: data.freeDeliveryThreshold !== null ? String(data.freeDeliveryThreshold) : null,
      zoneFees: data.zoneFees,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: deliverySettings.id,
      set: {
        flatFee: String(data.flatFee),
        freeDeliveryThreshold:
          data.freeDeliveryThreshold !== null ? String(data.freeDeliveryThreshold) : null,
        zoneFees: data.zoneFees,
        updatedAt: new Date(),
      },
    });

  revalidatePath("/admin/delivery");
  revalidatePath("/checkout");
}

const storeSchema = z.object({
  storeName: z.string().trim().min(1),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  whatsappNumber: z.string().trim().optional(),
  openingHours: z.string().trim().optional(),
});

export async function updateStoreSettings(input: z.infer<typeof storeSchema>) {
  await requireAdmin();
  const data = storeSchema.parse(input);

  await db
    .insert(storeSettings)
    .values({
      id: 1,
      storeName: data.storeName,
      address: data.address || null,
      phone: data.phone || null,
      whatsappNumber: data.whatsappNumber || null,
      openingHours: data.openingHours || null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: storeSettings.id,
      set: {
        storeName: data.storeName,
        address: data.address || null,
        phone: data.phone || null,
        whatsappNumber: data.whatsappNumber || null,
        openingHours: data.openingHours || null,
        updatedAt: new Date(),
      },
    });

  revalidateTag("store-settings", "max");
  revalidatePath("/");
  revalidatePath("/admin/settings");
}
