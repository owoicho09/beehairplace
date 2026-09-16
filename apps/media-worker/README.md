# Bee Hairplace — media worker

Small Node/Express service that transcodes uploaded product videos (H.264 MP4, capped at 1080px, faststart) and extracts a poster frame, using a statically-bundled ffmpeg/ffprobe (no system install required).

It exists as a separate service (rather than a Next.js API route) because video transcoding needs a real ffmpeg binary and can run longer than is comfortable inside a typical serverless function.

## How it fits together

1. The web app's admin uploads a raw video directly to a private Supabase Storage bucket, then calls this service's `/process` endpoint with the media id and a signed download URL.
2. This service downloads the file, transcodes it, uploads the result + poster to the public Supabase Storage bucket, and calls back the web app's `/api/admin/media/callback` route with the outcome.

## Running locally

```bash
npm install
cp .env.example .env   # fill in MEDIA_WORKER_SECRET (must match the web app's) and Supabase credentials
npm run dev
```

Set `MEDIA_WORKER_URL=http://localhost:8787` in the web app's `.env` while developing locally.

## Deploying

Any platform that runs a long-lived Node process works (Railway, Fly.io, Render). A `Dockerfile` is included. Set the same environment variables as `.env.example`, plus whatever `PORT` the platform expects. Point the web app's `MEDIA_WORKER_URL` at the deployed URL.
