"use server";

import { getAuthUserId } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createBookingSchema, type CreateBookingInput } from "./validation";

export type BookingResult =
  | { ok: true; reference: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string>; signedOut?: boolean };

/** Friendly text for the error codes raised by the `create_booking` database function. */
const DATABASE_ERRORS: Record<string, string> = {
  not_signed_in: "Please log in to book a stay.",
  dates_in_past: "Check-in cannot be in the past. Please choose new dates.",
  dates_reversed: "Check-out must be after check-in.",
  stay_too_long: "You can book up to 30 nights at a time.",
  invalid_party: "Please check the number of guests and rooms.",
  too_many_guests: "This room type cannot hold that many guests. Add rooms or choose a larger room.",
  invalid_guests: "Please check the guest details.",
  room_not_found: "This room is no longer available to book.",
  sold_out: "Sorry, this room was just booked for some of your dates. Please choose different dates or another room.",
};

/**
 * Creates a demo booking. The browser sends the stay and guest details only; the database function
 * validates them again, checks availability under a lock, works out the price and saves the booking.
 */
export async function createBooking(input: CreateBookingInput): Promise<BookingResult> {
  const parsed = createBookingSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0] ?? "form")] ??= issue.message;
    return { ok: false, message: "Please fix the highlighted details and try again.", fieldErrors };
  }
  const data = parsed.data;

  // The signed-in user comes from the verified session; the database function re-checks it too.
  if (!(await getAuthUserId())) {
    return { ok: false, signedOut: true, message: DATABASE_ERRORS.not_signed_in };
  }

  const guests = [
    { full_name: data.fullName, email: data.email, phone: data.phone ?? "" },
    ...data.additionalGuests.filter((g) => g.fullName).map((g) => ({ full_name: g.fullName, email: "", phone: "" })),
  ];

  const supabase = await createClient();
  const { data: booking, error } = await supabase.rpc("create_booking", {
    p_room_id: data.roomId,
    p_check_in: data.checkIn,
    p_check_out: data.checkOut,
    p_guest_count: data.guests,
    p_room_count: data.rooms,
    p_guests: guests,
    p_special_requests: data.specialRequests ?? "",
    p_idempotency_key: data.idempotencyKey,
  });

  if (error) {
    const known = DATABASE_ERRORS[error.message];
    if (known) return { ok: false, message: known, signedOut: error.message === "not_signed_in" };
    return { ok: false, message: "We could not complete your booking. Please try again." };
  }

  const reference = (booking as { reference?: string } | null)?.reference;
  if (!reference) return { ok: false, message: "We could not complete your booking. Please try again." };
  return { ok: true, reference };
}

export type CancelResult = { ok: true } | { ok: false; message: string };

const CANCEL_ERRORS: Record<string, string> = {
  not_signed_in: "Please log in to manage your bookings.",
  booking_not_found: "We could not find that booking.",
  not_cancellable: "This booking can no longer be cancelled (it has started or is already finished).",
};

/** Cancels the signed-in user's own future booking. The database function enforces who and when. */
export async function cancelBooking(reference: string): Promise<CancelResult> {
  if (typeof reference !== "string" || !/^TN-[A-Za-z0-9]{8}$/.test(reference)) {
    return { ok: false, message: CANCEL_ERRORS.booking_not_found };
  }
  if (!(await getAuthUserId())) return { ok: false, message: CANCEL_ERRORS.not_signed_in };

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_booking", { p_reference: reference });
  if (error) {
    return {
      ok: false,
      message: CANCEL_ERRORS[error.message] ?? "We could not cancel this booking. Please try again.",
    };
  }
  return { ok: true };
}
