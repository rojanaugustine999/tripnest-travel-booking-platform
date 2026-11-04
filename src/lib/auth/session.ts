import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

/*
 * Data Access Layer for "who is signed in?". Every server check goes through here.
 *
 * - `getClaims()` verifies the session token's signature, unlike `getSession()`, which only
 *   reads the cookie (and anyone can forge a cookie).
 * - Admin rights come from `profiles.role` in the database, not from anything in the token
 *   or the browser.
 * - React `cache()` means one lookup per request, however many components ask.
 */

export type CurrentProfile = Pick<Tables<"profiles">, "id" | "email" | "full_name" | "avatar_url" | "role">;

export const getAuthUserId = cache(async (): Promise<string | null> => {
  // Session checks compare the token's expiry with the current time, so they must only run at
  // request time — never while Next.js prerenders the static shell.
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return data.claims.sub;
});

export const getCurrentProfile = cache(async (): Promise<CurrentProfile | null> => {
  const userId = await getAuthUserId();
  if (!userId) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, role")
    .eq("id", userId)
    .maybeSingle();
  return data;
});

/** For pages that need a signed-in user. Sends guests to the login page, then back here. */
export async function requireUser(returnTo: string) {
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return profile;
}

/**
 * For admin-only pages and actions. Guests go to login; signed-in non-admins get a 404 so the
 * admin area is not even revealed to exist.
 */
export async function requireAdmin(returnTo = "/admin") {
  const profile = await requireUser(returnTo);
  if (profile.role !== "admin") notFound();
  return profile;
}
