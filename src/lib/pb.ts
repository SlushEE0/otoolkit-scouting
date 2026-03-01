/**
 * Supabase client utilities.
 *
 * This module replaces the former PocketBase integration. All database
 * operations now go through Supabase or the offline IndexedDB layer.
 */

export { getSBBrowserClient } from "./supabase/sbClient";
export { getSupabaseClient, getProfileImageUrl } from "./supabase";

