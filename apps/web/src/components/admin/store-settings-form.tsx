"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { updateStoreSettings } from "@/lib/admin/settings/actions";

type FormValues = {
  storeName: string;
  address: string;
  phone: string;
  whatsappNumber: string;
  openingHours: string;
};

export function StoreSettingsForm({ defaultValues }: { defaultValues: FormValues }) {
  const { register, handleSubmit } = useForm<FormValues>({ defaultValues });
  const [saved, setSaved] = useState(false);

  async function onSubmit(values: FormValues) {
    await updateStoreSettings(values);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="text-sm text-ink-soft">Store name</label>
        <input
          {...register("storeName")}
          className="mt-1 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
      <div>
        <label className="text-sm text-ink-soft">Address</label>
        <textarea
          {...register("address")}
          rows={2}
          className="mt-1 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
      <div>
        <label className="text-sm text-ink-soft">Phone</label>
        <input
          {...register("phone")}
          className="mt-1 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
      <div>
        <label className="text-sm text-ink-soft">WhatsApp number (with country code)</label>
        <input
          {...register("whatsappNumber")}
          placeholder="2348012345678"
          className="mt-1 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
      <div>
        <label className="text-sm text-ink-soft">Opening hours</label>
        <input
          {...register("openingHours")}
          placeholder="Mon–Sat, 9am–7pm"
          className="mt-1 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>

      <button type="submit" className="bg-ink px-6 py-2.5 text-sm text-ivory">
        {saved ? "Saved" : "Save"}
      </button>
    </form>
  );
}
