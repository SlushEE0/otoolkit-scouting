import type { User as SupabaseUser } from "@supabase/supabase-js";

/**
 * Supabase-based user types.
 *
 * `User` is the Supabase auth user.
 * `UserData` is an optional profile table row – adjust fields to match
 * your Supabase "UserData" table once created.
 */

export type User = SupabaseUser;

export interface UserData {
  id: string;
  user_id: string;
  user_name: string;
  avatar_url: string | null;
  role: "member" | "admin" | "guest";
  created_at: string;
  updated_at: string;
}

export type FullUserData = User & UserData;

/**
 * Convenience type for displaying user info in the UI.
 */
export interface DisplayUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  role: "member" | "admin" | "guest";
}

/**
 * Convert a Supabase auth User + optional UserData into a display-friendly format.
 */
export function toDisplayUser(
  user: User,
  userData?: UserData | null
): DisplayUser {
  return {
    id: user.id,
    name:
      userData?.user_name ||
      user.user_metadata?.name ||
      user.email ||
      "Unknown User",
    email: user.email || "",
    avatar_url:
      userData?.avatar_url || user.user_metadata?.avatar_url || null,
    role: userData?.role || "guest"
  };
}

