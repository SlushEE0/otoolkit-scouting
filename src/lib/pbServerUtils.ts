"use server";

/**
 * Server-side auth utilities.
 *
 * Supabase SSR (@supabase/ssr) manages its own cookie-based sessions,
 * so the old PocketBase cookie helpers are no longer needed.
 * This module is retained for any future server-side auth needs.
 */

import { getSBServerClientWithNextJSCookies } from "./supabase/sbServer";

/**
 * Get the currently authenticated Supabase user on the server.
 */
export async function getServerUser() {
  try {
    const sb = await getSBServerClientWithNextJSCookies();
    const {
      data: { user }
    } = await sb.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

