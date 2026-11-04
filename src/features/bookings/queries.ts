import "server-only";
import { format } from "date-fns";
import { getAuthUserId } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

/*
 * "My bookings" data. Every query filters by the signed-in user's id explicitly: Row Level Security already
 * limits normal users to their own rows, but admins are allowed to read all bookings, and "my bookings"
 * must never show other people's.
 */

const BOOKING_SELECT = `*,
  hotel:hotels(name, slug, city, address, check_in_time, check_out_time, cancellation_policy, hotel_images(url, alt, position)),
  room:rooms(name, bed_info),
  booking_guests(full_name, email, phone, is_primary)`;

export async function getMyBookings() {
  const userId = await getAuthUserId();
  if (!userId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("user_id", userId)
    .order("check_in", { ascending: false });
  if (error) throw new Error(`Could not load bookings: ${error.message}`);
  return data;
}

export type BookingRow = Awaited<ReturnType<typeof getMyBookings>>[number];

export async function getMyBooking(reference: string): Promise<BookingRow | null> {
  const userId = await getAuthUserId();
  if (!userId) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("user_id", userId)
    .eq("reference", reference.trim().toUpperCase())
    .maybeSingle();
  if (error) throw new Error(`Could not load booking: ${error.message}`);
  return data;
}

export const todayIso = () => format(new Date(), "yyyy-MM-dd");

/** A stay that is still ahead of (or happening now for) the guest and not cancelled. */
export function isUpcoming(booking: Pick<BookingRow, "status" | "check_out">, today = todayIso()) {
  return (booking.status === "pending" || booking.status === "confirmed") && booking.check_out >= today;
}

/** Only future stays that have not started can be cancelled (the database enforces this too). */
export function isCancellable(booking: Pick<BookingRow, "status" | "check_in">, today = todayIso()) {
  return (booking.status === "pending" || booking.status === "confirmed") && booking.check_in > today;
}

export async function getMySavedHotelIds(): Promise<string[]> {
  const userId = await getAuthUserId();
  if (!userId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_hotels")
    .select("hotel_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load saved hotels: ${error.message}`);
  return data.map((row) => row.hotel_id);
}
