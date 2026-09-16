import path from "node:path";
import { promises as fs } from "node:fs";
import os from "node:os";

import "dotenv/config";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffprobePath from "@ffprobe-installer/ffprobe";
import { createClient } from "@supabase/supabase-js";
import express from "express";

import { probeVideo, transcodeVideo, extractPoster } from "./ffmpeg";

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
const WORKER_SECRET = process.env.MEDIA_WORKER_SECRET;
const PUBLIC_BUCKET = process.env.SUPABASE_PUBLIC_MEDIA_BUCKET ?? "media";

if (!WORKER_SECRET) {
  throw new Error("MEDIA_WORKER_SECRET is not set");
}
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Supabase URL / service role key is not set");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, ffmpeg: ffmpegPath.path, ffprobe: ffprobePath.path });
});

app.post("/process", async (req, res) => {
  const auth = req.headers.authorization?.replace("Bearer ", "");
  if (auth !== WORKER_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { mediaId, downloadUrl, callbackUrl } = req.body as {
    mediaId: string;
    rawPath: string;
    downloadUrl: string;
    callbackUrl: string;
  };

  if (!mediaId || !downloadUrl || !callbackUrl) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Acknowledge immediately; processing continues in the background and
  // reports back via callbackUrl. Video transcoding of short mobile clips
  // is fast, but we don't want the caller to hold a connection open for it.
  res.json({ accepted: true });

  processJob({ mediaId, downloadUrl, callbackUrl }).catch((error) => {
    console.error(`Unhandled error processing media ${mediaId}`, error);
  });
});

async function processJob(params: {
  mediaId: string;
  downloadUrl: string;
  callbackUrl: string;
}) {
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), "bhp-media-"));
  const inputPath = path.join(workDir, "input");
  const outputPath = path.join(workDir, "output.mp4");
  const posterPath = path.join(workDir, "poster.jpg");

  const jobStart = Date.now();

  try {
    const response = await fetch(params.downloadUrl);
    if (!response.ok) {
      throw new Error(`Failed to download source video: ${response.status}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(inputPath, buffer);

    const probe = await probeVideo(inputPath);
    await transcodeVideo(inputPath, outputPath);
    await extractPoster(inputPath, posterPath, probe.durationSeconds);

    const processedPath = `${params.mediaId}/video.mp4`;
    const posterStoragePath = `${params.mediaId}/poster.jpg`;

    const [videoBuffer, posterBuffer] = await Promise.all([
      fs.readFile(outputPath),
      fs.readFile(posterPath),
    ]);

    // 1-year cache: each processed file lives at a permanent, unique
    // mediaId-based path and is never mutated in place, so it's safe to
    // cache indefinitely at the browser/CDN level (a replaced video gets a
    // new media row and therefore a new path, per src/lib/admin/products/actions.ts).
    const IMMUTABLE_CACHE_CONTROL = "31536000";

    const [videoUpload, posterUpload] = await Promise.all([
      supabase.storage
        .from(PUBLIC_BUCKET)
        .upload(processedPath, videoBuffer, {
          contentType: "video/mp4",
          upsert: true,
          cacheControl: IMMUTABLE_CACHE_CONTROL,
        }),
      supabase.storage
        .from(PUBLIC_BUCKET)
        .upload(posterStoragePath, posterBuffer, {
          contentType: "image/jpeg",
          upsert: true,
          cacheControl: IMMUTABLE_CACHE_CONTROL,
        }),
    ]);

    if (videoUpload.error) throw videoUpload.error;
    if (posterUpload.error) throw posterUpload.error;

    await reportResult(params.callbackUrl, {
      mediaId: params.mediaId,
      status: "ready",
      processedPath,
      posterPath: posterStoragePath,
      width: probe.width,
      height: probe.height,
      durationSeconds: probe.durationSeconds,
    });

    console.log(`[${params.mediaId}] processed in ${Date.now() - jobStart}ms`);
  } catch (error) {
    console.error(`Failed to process media ${params.mediaId}`, error);
    await reportResult(params.callbackUrl, {
      mediaId: params.mediaId,
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Unknown processing error",
    }).catch((cbError) => {
      console.error(`Failed to report failure for media ${params.mediaId}`, cbError);
    });
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
}

async function reportResult(callbackUrl: string, body: Record<string, unknown>) {
  const res = await fetch(callbackUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${WORKER_SECRET}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Callback failed: ${res.status} ${await res.text()}`);
  }
}

app.listen(PORT, () => {
  console.log(`Media worker listening on port ${PORT}`);
});
