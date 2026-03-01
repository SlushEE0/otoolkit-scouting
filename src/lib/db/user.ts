import { makeSBRequest } from "../supabase";
import type { User, UserData, DisplayUser } from "@/lib/types/pocketbase";
import { toDisplayUser } from "@/lib/types/pocketbase";

/**
 * Fetch user profile data from the Supabase "UserData" table.
 */
export async function getUserData(
  userId: string
): Promise<UserData | null> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb
      .from("UserData")
      .select("*")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle()
  );

  if (error || !data) {
    return null;
  }

  return data as UserData;
}

