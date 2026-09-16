# Bee Hairplace — web app

Next.js 16 storefront + admin for Bee Hairplace. See `../../build-prompt.txt` for the product brief and the approved plan for the architecture behind these choices.

## First-time setup

1. **Create a Supabase project** at supabase.com. Note the project URL, anon key, service role key, and Postgres connection string (Project Settings → API and → Database).
2. **Create two Storage buckets**: a **private** one for raw uploads (default name `raw-media`) and a **public** one for processed output (default name `media`). Bucket names must match `SUPABASE_RAW_MEDIA_BUCKET` / `SUPABASE_PUBLIC_MEDIA_BUCKET` in `.env`.
3. **Fill in `.env`** in this directory (copy from `.env.example` if starting fresh) — Supabase keys, `DATABASE_URL`, Paystack keys (test mode to start), and generate secrets for `ADMIN_SESSION_SECRET` / `MEDIA_WORKER_SECRET` / `CRON_SECRET` with `openssl rand -base64 32`.
4. **Install dependencies**: `npm install`
5. **Run migrations**: `npm run db:migrate`
6. **Seed starter data** (categories, store settings, delivery settings): `npm run seed`
7. **Create the admin user**: set `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`, then `npm run create-admin`
8. **Run the media worker** (see `../media-worker/README.md`) — required for video uploads to process. Set `MEDIA_WORKER_URL` to wherever it's running (`http://localhost:8787` locally).
9. **Start the app**: `npm run dev`, then sign in at `/admin/login`.

## Scripts

- `npm run dev` / `npm run build` / `npm run start` — Next.js app
- `npm run db:generate` — generate a new migration after changing `src/lib/db/schema.ts`
- `npm run db:migrate` — apply pending migrations
- `npm run db:studio` — browse the database with Drizzle Studio
- `npm run seed` — insert starter categories/settings
- `npm run create-admin` — create or reset the single admin user from `ADMIN_EMAIL`/`ADMIN_PASSWORD`

## Paystack webhook

Point a webhook at `https://<your-domain>/api/webhooks/paystack` in the Paystack dashboard (Settings → API Keys & Webhooks). In local development, use the Paystack CLI or a tunnel (e.g. `ngrok http 3000`) to receive webhook calls.

## Media cleanup cron

`vercel.json` schedules a daily call to `/api/cron/media-cleanup`, which Vercel authenticates automatically using the `CRON_SECRET` env var. If deploying elsewhere, trigger that route on a schedule yourself with `Authorization: Bearer $CRON_SECRET`.
