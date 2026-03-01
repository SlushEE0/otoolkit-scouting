/**
 * Supabase helpers – re-exports and shared utilities.
 *
 * Client-side code should use `getSBBrowserClient()` from `./supabase/sbClient`.
 * Server-side code should use `getSBServerClientWithNextJSCookies()` from `./supabase/sbServer`.
 *
 * `getSupabaseClient()` is a convenience alias for config-sync features that
 * need to degrade gracefully when Supabase env vars are not set (offline mode).
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { getSBBrowserClient } from "./supabase/sbClient";
import { logger } from "./logger";

export { getSBBrowserClient } from "./supabase/sbClient";

/**
 * Returns the Supabase browser client, or null if env vars are not configured.
 * Use this for features that should degrade gracefully offline.
 */
export function getSupabaseClient(): SupabaseClient | null {
  try {
    return getSBBrowserClient();
  } catch {
    return null;
  }
}

/**
 * Convenience wrapper to execute a Supabase request with logging.
 */
export async function makeSBRequest<T>(
  fn: (sb: ReturnType<typeof getSBBrowserClient>) => Promise<T>,
  client?: SupabaseClient
): Promise<T> {
  const sb = client ?? getSBBrowserClient();

  const ret = await fn(sb as ReturnType<typeof getSBBrowserClient>);

  if (ret && typeof ret === "object" && "error" in ret) {
    const errObj = ret as Record<string, unknown>;
    if (errObj.error) {
      logger.error({ ret }, "[SBRequest] Request Failed");
      return ret;
    }
  }

  return ret;
}

/**
 * Get a user's profile/avatar image URL.
 * With Supabase, avatars come from the user's OAuth provider metadata.
 */
export function getProfileImageUrl(
  user?: { avatar_url?: string | null } | null
): string | undefined {
  if (user?.avatar_url) return user.avatar_url;
  return undefined;
}
