import "server-only";

/**
 * Notifies the media-worker service that a raw video is ready to be
 * transcoded. Fire-and-forget from the caller's perspective: the worker
 * reports back to /api/admin/media/callback when it finishes.
 */
export async function triggerMediaProcessing(params: {
  mediaId: string;
  rawPath: string;
  downloadUrl: string;
}) {
  const workerUrl = process.env.MEDIA_WORKER_URL;
  const secret = process.env.MEDIA_WORKER_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!workerUrl || !secret) {
    throw new Error("Media worker is not configured (MEDIA_WORKER_URL / MEDIA_WORKER_SECRET)");
  }

  const res = await fetch(`${workerUrl}/process`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({
      mediaId: params.mediaId,
      rawPath: params.rawPath,
      downloadUrl: params.downloadUrl,
      callbackUrl: `${siteUrl}/api/admin/media/callback`,
    }),
  });

  if (!res.ok) {
    throw new Error(`Media worker rejected job: ${res.status} ${await res.text()}`);
  }
}
