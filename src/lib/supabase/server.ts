import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "./env";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * Create a new one per request — it reads the signed-in user's session from the request cookies.
 *
 * Server Components cannot write cookies, so `setAll` is allowed to fail there; the Proxy
 * (src/proxy.ts, Phase 5) refreshes sessions and writes cookies on every request.
 * To check who the user is on the server, always use `supabase.auth.getClaims()`, never getSession().
 */
export async function createClient() {
  const { url, publishableKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component — safe to ignore because the Proxy refreshes sessions.
        }
      },
    },
  });
}
