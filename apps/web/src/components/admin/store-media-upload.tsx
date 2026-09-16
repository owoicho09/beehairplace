"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { confirmStoreMediaUploaded, requestStoreMediaUpload } from "@/lib/admin/homepage/actions";
import { getSupabaseBrowserClient } from "@/lib/media/browser-client";

export function StoreMediaUpload({
  target,
  label,
  currentPosterUrl,
  currentStatus,
}: {
  target: "hero" | "store";
  label: string;
  currentPosterUrl: string | null;
  currentStatus: string | null;
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const extension = file.name.split(".").pop() || "mp4";
      const { mediaId, token, rawPath, bucket } = await requestStoreMediaUpload({
        target,
        fileExtension: extension,
      });

      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.storage.from(bucket).uploadToSignedUrl(rawPath, token, file);
      if (error) throw error;

      await confirmStoreMediaUploaded(mediaId, target);
      router.refresh();
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <p className="text-sm font-medium text-ink">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        <div className="relative h-20 w-16 overflow-hidden border border-line bg-warm-grey-light">
          {currentPosterUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentPosterUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div>
          {currentStatus && currentStatus !== "ready" && (
            <p className="text-xs capitalize text-burgundy">{currentStatus}</p>
          )}
          <label className="mt-1 inline-block cursor-pointer border border-line px-3 py-1.5 text-xs">
            {uploading ? "Uploading…" : "Replace video"}
            <input
              type="file"
              accept="video/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
