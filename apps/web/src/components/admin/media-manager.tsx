"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  confirmMediaUploaded,
  deleteMedia,
  requestMediaUpload,
  retryMediaProcessing,
} from "@/lib/admin/products/actions";
import { getSupabaseBrowserClient } from "@/lib/media/browser-client";

export type MediaItem = {
  id: string;
  kind: "video" | "photo";
  role: "primary" | "gallery" | "store";
  status: "pending" | "processing" | "ready" | "failed";
  posterUrl: string | null;
  errorMessage: string | null;
};

export function MediaManager({
  productId,
  primaryVideo,
  gallery,
}: {
  productId: string;
  primaryVideo: MediaItem | null;
  gallery: MediaItem[];
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  async function uploadFile(file: File, kind: "video" | "photo", role: "primary" | "gallery") {
    setUploading(true);
    try {
      const extension = file.name.split(".").pop() || (kind === "video" ? "mp4" : "jpg");
      const { mediaId, token, rawPath, bucket } = await requestMediaUpload({
        productId,
        kind,
        role,
        fileExtension: extension,
      });

      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.storage
        .from(bucket)
        .uploadToSignedUrl(rawPath, token, file);

      if (error) throw error;

      await confirmMediaUploaded(mediaId);
      router.refresh();
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-ink">Product video</p>
        <p className="text-xs text-ink-soft">Required before publishing.</p>

        {primaryVideo ? (
          <MediaCard item={primaryVideo} onRetry={() => retryMediaProcessing(primaryVideo.id).then(() => router.refresh())} onDelete={() => deleteMedia(primaryVideo.id).then(() => router.refresh())} />
        ) : (
          <label className="mt-2 flex h-28 w-24 cursor-pointer items-center justify-center border border-dashed border-line text-xs text-ink-soft">
            {uploading ? "Uploading…" : "Add video"}
            <input
              type="file"
              accept="video/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadFile(file, "video", "primary");
              }}
            />
          </label>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-ink">Photos (optional)</p>
        <div className="mt-2 flex flex-wrap gap-3">
          {gallery.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onDelete={() => deleteMedia(item.id).then(() => router.refresh())}
            />
          ))}
          <label className="flex h-28 w-24 cursor-pointer items-center justify-center border border-dashed border-line text-xs text-ink-soft">
            {uploading ? "Uploading…" : "Add photo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadFile(file, "photo", "gallery");
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

function MediaCard({
  item,
  onRetry,
  onDelete,
}: {
  item: MediaItem;
  onRetry?: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="relative h-28 w-24 overflow-hidden border border-line bg-warm-grey-light">
      {item.posterUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.posterUrl} alt="" className="h-full w-full object-cover" />
      )}
      {item.status !== "ready" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-ink/60 p-1 text-center text-[10px] text-ivory">
          <span className="capitalize">{item.status}</span>
          {item.status === "failed" && onRetry && (
            <button type="button" onClick={onRetry} className="underline">
              Retry
            </button>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={onDelete}
        aria-label="Remove"
        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-[10px] text-ivory"
      >
        ×
      </button>
    </div>
  );
}
