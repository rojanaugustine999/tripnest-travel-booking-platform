import "server-only";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_PAGE_SIZE, type BookingFilters } from "./validation";

/*
 * Admin data. These run with the signed-in admin's session, so Row Level Security lets them read everything
 * (including unpublished and archived hotels). Pages call requireAdmin() first; a non-admin would only get
 * their own rows here anyway.
 */

export type AdminStats = {
  hotels: number;
  published_hotels: number;
  rooms: number;
  bookings: number;
  users: number;
  demo_revenue: number;
  by_status: { status: string; count: number }[];
  per_day: { day: string; count: number }[];
  recent: {
    reference: string;
    status: string;
    total_amount: number;
    created_at: string;
    check_in: string;
    check_out: string;
    hotel: string | null;
    guest_email: string | null;
  }[];
  popular: { name: string; slug: string; bookings: number }[];
};

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_dashboard_stats");
  if (error) throw new Error(`Could not load statistics: ${error.message}`);
  return data as unknown as AdminStats;
}

export async function getAdminHotels() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hotels")
    .select(
      "id, slug, name, city, star_rating, is_published, is_featured, archived_at, destination:destinations(name), rooms(count)",
    )
    .order("name");
  if (error) throw new Error(`Could not load hotels: ${error.message}`);
  return data;
}

export async function getAdminHotel(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hotels")
    .select("*, hotel_images(url, alt, position), hotel_amenities(amenity_id, position)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Could not load hotel: ${error.message}`);
  return data;
}

export async function getHotelFormOptions() {
  const supabase = await createClient();
  const [destinations, amenities] = await Promise.all([
    supabase.from("destinations").select("id, name, country").order("name"),
    supabase.from("amenities").select("id, name, slug").order("display_order"),
  ]);
  if (destinations.error || amenities.error) throw new Error("Could not load form options.");
  return { destinations: destinations.data, amenities: amenities.data };
}

export async function getAdminRooms(hotelId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("rooms").select("*").eq("hotel_id", hotelId).order("price_per_night");
  if (error) throw new Error(`Could not load rooms: ${error.message}`);
  return data;
}

export async function getAdminHotelName(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("hotels").select("id, name, slug").eq("id", id).maybeSingle();
  return data;
}

const ADMIN_BOOKING_SELECT = `*,
  hotel:hotels(name, slug),
  room:rooms(name),
  guest:profiles(email, full_name),
  booking_guests(full_name, email, phone, is_primary)`;

export async function getAdminBookings(filters: BookingFilters) {
  const supabase = await createClient();
  let query = supabase
    .from("bookings")
    .select(ADMIN_BOOKING_SELECT, { count: "exact" })
    .order("created_at", { ascending: false });
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.q) {
    // Only letters, numbers and dashes are searched, so the text cannot change the filter itself.
    const term = filters.q.replace(/[^A-Za-z0-9-]/g, "");
    if (term) query = query.ilike("reference", `${term}%`);
  }
  const from = (filters.page - 1) * ADMIN_PAGE_SIZE;
  const { data, error, count } = await query.range(from, from + ADMIN_PAGE_SIZE - 1);
  if (error) throw new Error(`Could not load bookings: ${error.message}`);
  return { items: data, total: count ?? 0 };
}

export type AdminBooking = Awaited<ReturnType<typeof getAdminBookings>>["items"][number];

export async function getAdminBooking(reference: string): Promise<AdminBooking | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(ADMIN_BOOKING_SELECT)
    .eq("reference", reference.trim().toUpperCase())
    .maybeSingle();
  if (error) throw new Error(`Could not load booking: ${error.message}`);
  return data;
}

export async function getAdminUsers(q?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("id, email, full_name, phone, role, created_at, bookings(count)")
    .order("created_at", { ascending: false })
    .limit(100);
  const term = q?.replace(/[^A-Za-z0-9@.+ -]/g, "").trim();
  if (term) query = query.or(`email.ilike.%${term}%,full_name.ilike.%${term}%`);
  const { data, error } = await query;
  if (error) throw new Error(`Could not load users: ${error.message}`);
  return data;
}
