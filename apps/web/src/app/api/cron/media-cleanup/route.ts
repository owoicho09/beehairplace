import { eq, isNotNull } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { productMedia } from "@/lib/db/schema";
import { getMediaStorage } from "@/lib/media/storage";

/**
 * Sweeps soft-deleted product_media rows and removes their underlying
 * storage objects, retrying any that failed on a previous run. Call this
 * on a schedule (e.g. a daily Vercel Cron hitting this route) rather than
 * deleting storage synchronously from user-facing requests.
 */
export async function POST(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const storage = getMediaStorage();
  const toDelete = await db.query.productMedia.findMany({
    where: isNotNull(productMedia.deletedAt),
  });

  let cleaned = 0;
  for (const media of toDelete) {
    try {
      await storage.delete("raw", media.rawPath);
      if (media.processedUrl) {
        const path = new URL(media.processedUrl).pathname.split("/public/")[1];
        if (path) await storage.delete("public", path);
      }
      if (media.posterUrl && media.posterUrl !== media.processedUrl) {
        const path = new URL(media.posterUrl).pathname.split("/public/")[1];
        if (path) await storage.delete("public", path);
      }
      await db.delete(productMedia).where(eq(productMedia.id, media.id));
      cleaned += 1;
    } catch (error) {
      console.error(`Failed to clean up media ${media.id}`, error);
      // Leave it soft-deleted; the next scheduled run retries.
    }
  }

  return NextResponse.json({ swept: cleaned, remaining: toDelete.length - cleaned });
}
