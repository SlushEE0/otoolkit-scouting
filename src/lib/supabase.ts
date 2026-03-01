/**
 * Supabase Client
 *
 * Provides a singleton Supabase client for config storage.
 * The URL and anon key are set via environment variables.
 * When running offline, Supabase calls will fail gracefully.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn(
      "Supabase env vars not set (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). Config sync disabled."
    );
    return null;
  }

  supabase = createClient(url, key);
  return supabase;
}
