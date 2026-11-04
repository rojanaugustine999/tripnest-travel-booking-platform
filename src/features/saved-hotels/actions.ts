"use server";

import { z } from "zod";
import { getAuthUserId } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

/*
 * Save / unsave a hotel. The signed-in user comes from the verified session on the server, never from
 * the browser, and Row Level Security on `saved_hotels` is a second lock: users can only touch their own rows.
 */

export type SaveResult = { ok: true } | { ok: false; signedOut?: boolean; message: string };

const hotelIdSchema = z.uuid();

export async function setHotelSaved(hotelId: string, saved: boolean): Promise<SaveResult> {
  const parsed = hotelIdSchema.safeParse(hotelId);
  if (!parsed.success) return { ok: false, message: "That hotel could not be found." };

  const userId = await getAuthUserId();
  if (!userId) return { ok: false, signedOut: true, message: "Please log in to save hotels." };

  const supabase = await createClient();
  if (saved) {
    const { error } = await supabase.from("saved_hotels").insert({ user_id: userId, hotel_id: parsed.data });
    // 23505 = already saved (double click or another tab): the end result is what the user wanted.
    if (error && error.code !== "23505")
      return { ok: false, message: "We could not save this hotel. Please try again." };
  } else {
    const { error } = await supabase.from("saved_hotels").delete().eq("user_id", userId).eq("hotel_id", parsed.data);
    if (error) return { ok: false, message: "We could not remove this hotel. Please try again." };
  }
  return { ok: true };
}

/** The signed-in user's saved hotel ids (empty when signed out). Loaded once per visit to colour the hearts. */
export async function getSavedHotelIds(): Promise<string[]> {
  const userId = await getAuthUserId();
  if (!userId) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("saved_hotels").select("hotel_id").eq("user_id", userId);
  return (data ?? []).map((row) => row.hotel_id);
}
