import { execFile } from "node:child_process";
import { promisify } from "node:util";

import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";

const execFileAsync = promisify(execFile);

const FFMPEG_BIN = ffmpegInstaller.path;
const FFPROBE_BIN = ffprobeInstaller.path;

// Caps output at 1080px on the long edge (portrait video stays sharp enough
// to show hair texture) while keeping files small for mobile/slower
// Nigerian networks. CRF 23 + veryfast preset balances quality vs
// processing time for short mobile clips.
const MAX_DIMENSION = 1080;

export type VideoProbe = {
  width: number;
  height: number;
  durationSeconds: number;
};

export async function probeVideo(inputPath: string): Promise<VideoProbe> {
  const { stdout } = await execFileAsync(FFPROBE_BIN, [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height",
    "-show_entries",
    "format=duration",
    "-of",
    "json",
    inputPath,
  ]);

  const parsed = JSON.parse(stdout) as {
    streams: { width: number; height: number }[];
    format: { duration: string };
  };

  const stream = parsed.streams[0];
  if (!stream) throw new Error("No video stream found in uploaded file");

  return {
    width: stream.width,
    height: stream.height,
    durationSeconds: Number(parsed.format.duration ?? 0),
  };
}

export async function transcodeVideo(inputPath: string, outputPath: string): Promise<void> {
  // force_original_aspect_ratio=decrease caps the long edge at MAX_DIMENSION;
  // the trunc(...)*2 wrapper keeps both dimensions even, which H.264
  // requires and a plain "min(...)" scale expression doesn't guarantee.
  // format=yuv420p normalizes any source chroma subsampling (some
  // phone/screen-recorded clips arrive as 4:4:4 or 4:2:2, which the "main"
  // H.264 profile below cannot encode) to the one format every browser and
  // the "main" profile both support.
  const scaleAndFormat = `scale='trunc(min(${MAX_DIMENSION},iw)/2)*2':'trunc(min(${MAX_DIMENSION},ih)/2)*2':force_original_aspect_ratio=decrease,format=yuv420p`;

  await execFileAsync(FFMPEG_BIN, [
    "-y",
    "-i",
    inputPath,
    "-vf",
    scaleAndFormat,
    "-c:v",
    "libx264",
    "-profile:v",
    "main",
    "-preset",
    "veryfast",
    "-crf",
    "23",
    "-movflags",
    "+faststart",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-ac",
    "2",
    outputPath,
  ]);
}

export async function extractPoster(
  inputPath: string,
  outputPath: string,
  durationSeconds: number,
): Promise<void> {
  // Grab a frame a fraction of the way in rather than frame zero, which is
  // often a black or blurry lead-in on phone-shot clips.
  const seekSeconds = Math.min(0.5, durationSeconds / 4);

  await execFileAsync(FFMPEG_BIN, [
    "-y",
    "-ss",
    String(seekSeconds),
    "-i",
    inputPath,
    "-frames:v",
    "1",
    "-vf",
    `scale='min(${MAX_DIMENSION},iw)':'min(${MAX_DIMENSION},ih)':force_original_aspect_ratio=decrease`,
    "-q:v",
    "3",
    outputPath,
  ]);
}
