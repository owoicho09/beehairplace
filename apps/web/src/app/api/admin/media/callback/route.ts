import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { productMedia } from "@/lib/db/schema";

const callbackSchema = z.object({
  mediaId: z.string().uuid(),
  status: z.enum(["ready", "failed"]),
  processedPath: z.string().optional(),
  posterPath: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  durationSeconds: z.number().optional(),
  errorMessage: z.string().optional(),
});

// Called by the media-worker service when transcoding finishes (or fails).
// Authenticated with a shared secret, not an admin session, since this is a
// server-to-server call.
export async function POST(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!secret || secret !== process.env.MEDIA_WORKER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = callbackSchema.parse(await request.json());

  const { getMediaStorage } = await import("@/lib/media/storage");
  const storage = getMediaStorage();

  if (body.status === "ready") {
    await db
      .update(productMedia)
      .set({
        status: "ready",
        processedUrl: body.processedPath ? storage.getPublicUrl(body.processedPath) : null,
        posterUrl: body.posterPath ? storage.getPublicUrl(body.posterPath) : null,
        width: body.width,
        height: body.height,
        durationSeconds: body.durationSeconds ? String(body.durationSeconds) : null,
        errorMessage: null,
      })
      .where(eq(productMedia.id, body.mediaId));
  } else {
    await db
      .update(productMedia)
      .set({ status: "failed", errorMessage: body.errorMessage ?? "Processing failed" })
      .where(eq(productMedia.id, body.mediaId));
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");

  return NextResponse.json({ received: true });
}
