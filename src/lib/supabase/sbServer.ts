"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cache } from "react";

type CookieStore = Parameters<typeof createServerClient>[2]["cookies"];

export const getSBServerClient = (cookieActions: CookieStore) => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
    );
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: cookieActions.getAll,
      setAll: cookieActions.setAll
    }
  });
};

export const getSBSuperuserClient = cache(() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleSecret = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleSecret) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  return createClient(url, serviceRoleSecret, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
});

export async function getSBServerClientWithNextJSCookies() {
  const cookieStore = await cookies();
  return getSBServerClient({
    getAll: () => {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value }) => cookieStore.set(name, value));
    }
  });
}
