import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { getAdminSession } from "./session";

/**
 * Verifies the admin session, redirecting to login if absent. Use this in
 * admin pages, Server Actions, and Route Handlers that require an
 * authenticated admin — never rely on layout-level checks alone.
 */
export const requireAdmin = cache(async () => {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
});

/**
 * Same as requireAdmin but returns null instead of redirecting — for use in
 * Route Handlers (e.g. webhooks/media callbacks) where a redirect response
 * doesn't make sense and the caller should return 401 itself.
 */
export const getVerifiedAdmin = cache(async () => {
  return getAdminSession();
});
