import { useState, useEffect } from "react";

import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import type { DisplayUser } from "@/lib/types/pocketbase";
import { toDisplayUser } from "@/lib/types/pocketbase";

/**
 * React hook that listens to Supabase auth state changes.
 * Returns the current Supabase user (or null if not logged in).
 *
 * Uses dynamic import so the app works offline when Supabase is unavailable.
 */
export function useUser() {
  const [user, setUser] = useState<DisplayUser | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    (async () => {
      try {
        const { getSBBrowserClient } = await import("@/lib/supabase/sbClient");
        const sb = getSBBrowserClient();

        // Get initial session
        const {
          data: { user: initialUser }
        } = await sb.auth.getUser();
        if (initialUser) {
          setUser(toDisplayUser(initialUser));
        }

        // Listen for auth state changes
        const {
          data: { subscription }
        } = sb.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
          if (session?.user) {
            setUser(toDisplayUser(session.user));
          } else {
            setUser(null);
          }
        });

        unsubscribe = () => subscription.unsubscribe();
      } catch {
        // Supabase not available (offline mode) – no user
      }
    })();

    return () => {
      unsubscribe?.();
    };
  }, []);

  return { user, setUser } as const;
}
