import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Migrations need a direct/session connection: Supabase's transaction
    // pooler (used by DATABASE_URL at runtime) doesn't support the
    // session-level locking drizzle-kit uses while migrating.
    url: process.env.SUPABASE_SESSION_POOLER ?? process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});
