# Bee Hairplace

Video-first e-commerce site for Bee Hairplace (Abuja, Nigeria). See `build-prompt.txt` for the original product brief.

## Structure

- `apps/web` — Next.js 16 storefront + admin. Start here: `apps/web/README.md`.
- `apps/media-worker` — video transcoding/poster-generation service. See `apps/media-worker/README.md`.

## Getting started

Follow `apps/web/README.md` end to end (Supabase project, env vars, migrations, seed data, admin user), then run the media worker per `apps/media-worker/README.md` before uploading any product videos.
