import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "./env";

/**
 * Supabase client for public catalogue reads (hotels, destinations). It sends no cookies, so it always
 * acts as a signed-out visitor — Row Level Security only shows published content — and its results can
 * safely be shared between visitors and cached with "use cache".
 */
export function createPublicClient() {
  const { url, publishableKey } = getSupabaseEnv();
  return createSupabaseClient<Database>(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
