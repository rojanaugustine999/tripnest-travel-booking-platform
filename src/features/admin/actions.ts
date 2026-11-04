"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  bookingStatusSchema,
  hotelFormSchema,
  roomFormSchema,
  splitLines,
  type HotelFormInput,
  type RoomFormInput,
} from "./validation";

/*
 * Admin Server Actions. Every one starts by checking the signed-in user's role on the server, and the
 * database checks it again (Row Level Security and the admin_* functions). Hiding admin links in the
 * browser is only cosmetic: these checks are what actually protect the data.
 */

export type AdminResult =
  { ok: true; id?: string; message?: string } | { ok: false; message: string; fieldErrors?: Record<string, string> };

const NOT_ALLOWED: AdminResult = { ok: false, message: "You do not have permission to do that." };

async function adminSession() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") return null;
  return { profile, supabase: await createClient() };
}

function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) errors[issue.path.map(String).join(".") || "form"] ??= issue.message;
  return errors;
}

/** Friendly text for errors raised by the admin_* database functions. */
const DB_ERRORS: Record<string, string> = {
  not_admin: "You do not have permission to do that.",
  slug_taken: "Another hotel already uses that URL name. Choose a different one.",
  invalid_offer: "An offer needs both a label and a discount percentage (or neither).",
  invalid_images: "Add between 1 and 12 images.",
  destination_not_found: "That destination does not exist.",
  hotel_not_found: "That hotel no longer exists.",
  booking_not_found: "That booking no longer exists.",
  invalid_transition: "That status change is not allowed for this booking.",
  cannot_change_own_role: "You cannot change your own role.",
  user_not_found: "That user no longer exists.",
};

const generic = (what: string): AdminResult => ({ ok: false, message: `We could not ${what}. Please try again.` });

// ---------------------------------------------------------------------------------- hotels

export async function saveHotel(input: HotelFormInput): Promise<AdminResult> {
  const session = await adminSession();
  if (!session) return NOT_ALLOWED;

  const parsed = hotelFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }
  const h = parsed.data;

  const { data, error } = await session.supabase.rpc("admin_save_hotel", {
    p_hotel: {
      id: h.id ?? null,
      slug: h.slug,
      destination_id: h.destinationId,
      name: h.name,
      city: h.city,
      address: h.address,
      accommodation_type: h.accommodationType,
      star_rating: h.starRating,
      short_description: h.shortDescription,
      description: h.description,
      facilities: splitLines(h.facilities),
      check_in_time: h.checkInTime,
      check_out_time: h.checkOutTime,
      cancellation_policy: h.cancellationPolicy,
      is_featured: h.isFeatured,
      is_published: h.isPublished,
      offer_label: h.offerLabel,
      offer_discount_percent: h.offerDiscountPercent === "" ? null : Number(h.offerDiscountPercent),
      images: h.images,
      amenity_ids: h.amenityIds,
    },
  });
  if (error) {
    const known = DB_ERRORS[error.message];
    return known ? { ok: false, message: known } : generic("save the hotel");
  }

  updateTag("hotels"); // public pages show the change straight away
  updateTag("destinations");
  return { ok: true, id: data, message: "Hotel saved." };
}

const idSchema = z.uuid();

export async function setHotelPublished(hotelId: string, published: boolean): Promise<AdminResult> {
  const session = await adminSession();
  if (!session || !idSchema.safeParse(hotelId).success) return NOT_ALLOWED;
  const { data, error } = await session.supabase
    .from("hotels")
    .update({ is_published: published })
    .eq("id", hotelId)
    .select("id");
  if (error || !data?.length) return generic(published ? "publish the hotel" : "unpublish the hotel");
  updateTag("hotels");
  updateTag("destinations");
  return { ok: true, message: published ? "Hotel published." : "Hotel unpublished." };
}

export async function setHotelArchived(hotelId: string, archived: boolean): Promise<AdminResult> {
  const session = await adminSession();
  if (!session || !idSchema.safeParse(hotelId).success) return NOT_ALLOWED;
  // Archiving also unpublishes, so a restored hotel never goes live by surprise.
  const { data, error } = await session.supabase
    .from("hotels")
    .update({ archived_at: archived ? new Date().toISOString() : null, is_published: false })
    .eq("id", hotelId)
    .select("id");
  if (error || !data?.length) return generic(archived ? "archive the hotel" : "restore the hotel");
  updateTag("hotels");
  updateTag("destinations");
  return { ok: true, message: archived ? "Hotel archived." : "Hotel restored (unpublished)." };
}

// ----------------------------------------------------------------------------------- rooms

export async function saveRoom(input: RoomFormInput): Promise<AdminResult> {
  const session = await adminSession();
  if (!session) return NOT_ALLOWED;

  const parsed = roomFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }
  const r = parsed.data;

  const row = {
    hotel_id: r.hotelId,
    name: r.name,
    description: r.description,
    price_per_night: r.pricePerNight,
    max_guests: r.maxGuests,
    bed_info: r.bedInfo,
    size_sqm: r.sizeSqm,
    amenities: splitLines(r.amenities, 20),
    total_units: r.totalUnits,
    blocked_units: r.blockedUnits,
    image_url: r.imageUrl || null,
    is_active: r.isActive,
  };

  const { data, error } = r.id
    ? await session.supabase.from("rooms").update(row).eq("id", r.id).select("id")
    : await session.supabase.from("rooms").insert(row).select("id");
  if (error || !data?.length) return generic("save the room");

  updateTag("hotels");
  return { ok: true, id: data[0].id, message: "Room saved." };
}

export async function setRoomActive(roomId: string, active: boolean): Promise<AdminResult> {
  const session = await adminSession();
  if (!session || !idSchema.safeParse(roomId).success) return NOT_ALLOWED;
  const { data, error } = await session.supabase
    .from("rooms")
    .update({ is_active: active })
    .eq("id", roomId)
    .select("id");
  if (error || !data?.length) return generic("update the room");
  updateTag("hotels");
  return { ok: true, message: active ? "Room is bookable again." : "Room hidden from guests." };
}

export async function deleteRoom(roomId: string): Promise<AdminResult> {
  const session = await adminSession();
  if (!session || !idSchema.safeParse(roomId).success) return NOT_ALLOWED;
  const { error } = await session.supabase.from("rooms").delete().eq("id", roomId);
  if (error) {
    // A room with bookings cannot be deleted (the database keeps booking history intact).
    return error.code === "23503"
      ? { ok: false, message: "This room has bookings, so it cannot be deleted. Hide it instead." }
      : generic("delete the room");
  }
  updateTag("hotels");
  return { ok: true, message: "Room deleted." };
}

// -------------------------------------------------------------------------------- bookings

export async function setBookingStatus(reference: string, status: string): Promise<AdminResult> {
  const session = await adminSession();
  if (!session) return NOT_ALLOWED;
  const parsed = bookingStatusSchema.safeParse(status);
  if (!parsed.success || !/^TN-[A-Za-z0-9]{8}$/.test(reference)) return generic("update the booking");

  const { error } = await session.supabase.rpc("admin_set_booking_status", {
    p_reference: reference,
    p_status: parsed.data,
  });
  if (error) return { ok: false, message: DB_ERRORS[error.message] ?? "We could not update the booking." };
  return { ok: true, message: `Booking marked ${parsed.data}.` };
}

// ----------------------------------------------------------------------------------- users

export async function setUserRole(userId: string, role: string): Promise<AdminResult> {
  const session = await adminSession();
  if (!session || !idSchema.safeParse(userId).success) return NOT_ALLOWED;
  if (role !== "user" && role !== "admin") return generic("change the role");

  const { error } = await session.supabase.rpc("admin_set_user_role", { p_user_id: userId, p_role: role });
  if (error) return { ok: false, message: DB_ERRORS[error.message] ?? "We could not change the role." };
  return { ok: true, message: `Role changed to ${role}.` };
}
