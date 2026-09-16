"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { updateDeliverySettings } from "@/lib/admin/settings/actions";

type FormValues = {
  flatFee: number;
  freeDeliveryThreshold: number | null;
  zoneFees: { zone: string; fee: number }[];
};

export function DeliverySettingsForm({ defaultValues }: { defaultValues: FormValues }) {
  const { register, control, handleSubmit } = useForm<FormValues>({ defaultValues });
  const { fields, append, remove } = useFieldArray({ control, name: "zoneFees" });
  const [saved, setSaved] = useState(false);

  async function onSubmit(values: FormValues) {
    await updateDeliverySettings(values);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="text-sm text-ink-soft">Standard delivery fee</label>
        <input
          type="number"
          step="0.01"
          {...register("flatFee")}
          className="mt-1 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>

      <div>
        <label className="text-sm text-ink-soft">Free delivery above (optional)</label>
        <input
          type="number"
          step="0.01"
          {...register("freeDeliveryThreshold")}
          className="mt-1 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>

      <div>
        <label className="text-sm text-ink-soft">Zone overrides (optional)</label>
        <div className="mt-2 space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(`zoneFees.${index}.zone` as const)}
                placeholder="Zone name"
                className="flex-1 border border-line px-3 py-2 text-sm outline-none focus:border-ink"
              />
              <input
                type="number"
                step="0.01"
                {...register(`zoneFees.${index}.fee` as const)}
                placeholder="Fee"
                className="w-28 border border-line px-3 py-2 text-sm outline-none focus:border-ink"
              />
              <button type="button" onClick={() => remove(index)} className="text-warm-grey">
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ zone: "", fee: 0 })}
            className="border border-line px-3 py-1.5 text-sm"
          >
            Add zone
          </button>
        </div>
      </div>

      <button type="submit" className="bg-ink px-6 py-2.5 text-sm text-ivory">
        {saved ? "Saved" : "Save"}
      </button>
    </form>
  );
}
