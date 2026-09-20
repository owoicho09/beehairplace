import type { NextConfig } from "next";

// Guarded: this file is evaluated at the very start of `next build`, before
// any page renders and before any of the runtime DB error-handling in
// src/lib/catalog/queries.ts applies. A malformed value here (missing
// protocol, stray whitespace/newline from a copy-paste, truncated string)
// would otherwise throw synchronously from `new URL(...)` and crash the
// entire build immediately — independent of, and earlier than, any
// database connectivity issue.
function getSupabaseHostname(): string | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) return undefined;
  try {
    return new URL(url).hostname;
  } catch (error) {
    console.error(
      `NEXT_PUBLIC_SUPABASE_URL is set but not a valid URL — Supabase-hosted images will not be optimized until this is fixed. Value length: ${url.length}.`,
      error,
    );
    return undefined;
  }
}

const supabaseHostname = getSupabaseHostname();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
