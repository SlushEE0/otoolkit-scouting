import { useState } from "react";

/**
 * Offline user hook — no authentication in this fully offline app.
 * Returns null user. Retained for API compatibility with components
 * that reference it (e.g. Navbar).
 */
export function useUser() {
  const [user] = useState<null>(null);
  return { user, setUser: () => {} } as const;
}
