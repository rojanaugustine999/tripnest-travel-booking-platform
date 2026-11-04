"use server";

import { getAuthUserId } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/features/auth/actions";
import { profileSchema, type ProfileInput } from "./validation";

/**
 * Updates the signed-in user's own name and phone. The user id comes from the verified session, and the
 * database only allows these two columns (plus the avatar) to be changed by users, so a role or email
 * cannot be slipped in through here.
 */
export async function updateProfile(input: ProfileInput): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0] ?? "form")] ??= issue.message;
    return { ok: false, fieldErrors };
  }

  const userId = await getAuthUserId();
  if (!userId) return { ok: false, message: "Please log in again to update your profile." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName, phone: parsed.data.phone || null })
    .eq("id", userId)
    .select("id");

  if (error || !data?.length) return { ok: false, message: "We could not save your changes. Please try again." };
  return { ok: true, message: "Your profile has been updated." };
}
