import { getSBBrowserClient } from "./sbClient";
import { logger } from "../logger";

export async function logout() {
  try {
    const supabase = getSBBrowserClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error({ err: error.message }, "Supabase sign out failed");
    }
  } catch (err) {
    logger.error({ err }, "Failed to sign out");
  }

  window.location.reload();
}
