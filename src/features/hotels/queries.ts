import { cacheLife, cacheTag } from "next/cache";
import type { Database } from "@/types/database";
import type { Amenity, Destination, Hotel, HotelSummary, Paginated, Review, Room } from "@/types/domain";
import { createPublicClient } from "@/lib/supabase/public";
import { mapDestination } from "@/features/destinations/mappers";
import { HOTELS_PAGE_SIZE, type HotelSearchParams } from "./lib/search-params";

/*
 * Data-access layer for hotels (Phase 6): reads Supabase as a signed-out visitor.
 * Results are cached with "use cache" and tagged, so an admin change can refresh them with revalidateTag.
 */

type SearchArgs = Database["public"]["Functions"]["search_hotels"]["Args"];
type SearchRow = Database["public"]["Functions"]["search_hotels"]["Returns"][number];

function toSummary(row: SearchRow): HotelSummary {
  const cover = row.cover_image as { url: string; alt: string };
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    city: row.city,
    accommodationType: row.accommodation_type,
    starRating: row.star_rating as Hotel["starRating"],
    reviewScore: Number(row.review_score),
    reviewCount: row.review_count,
    popularity: row.popularity,
    shortDescription: row.short_description,
    isFeatured: row.is_featured,
    offer: row.offer_label ? { label: row.offer_label, discountPercent: row.offer_discount_percent } : null,
    images: [cover],
    destination: row.destination as HotelSummary["destination"],
    amenities: row.amenities as Amenity[],
    priceFrom: Number(row.price_from),
    hasAvailability: row.has_availability,
  };
}

async function search(args: SearchArgs) {
  const { data, error } = await createPublicClient().rpc("search_hotels", args);
  if (error) throw new Error(`Hotel search failed: ${error.message}`);
  return data ?? [];
}

export async function getHotels(params: HotelSearchParams): Promise<Paginated<HotelSummary>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("hotels");

  const rows = await search({
    p_query: params.q,
    p_destination: params.destination,
    p_min_price: params.minPrice,
    p_max_price: params.maxPrice,
    p_stars: params.stars,
    p_min_rating: params.rating,
    p_types: params.types,
    p_amenities: params.amenities,
    p_guests: params.guests,
    p_rooms: params.rooms,
    p_available_only: params.available,
    p_sort: params.sort,
    p_page: params.page,
    p_page_size: HOTELS_PAGE_SIZE,
  });
  const total = rows[0] ? Number(rows[0].total_count) : 0;
  return {
    items: rows.map(toSummary),
    total,
    page: rows[0]?.page ?? 1,
    pageCount: Math.max(1, Math.ceil(total / HOTELS_PAGE_SIZE)),
  };
}

/** Every published hotel (the catalogue is small; the function caps one page at 50). */
async function getAllSummaries(): Promise<HotelSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("hotels");
  return (await search({ p_page_size: 50, p_guests: 1 })).map(toSummary);
}

export async function getFeaturedHotels(limit = 6): Promise<HotelSummary[]> {
  return (await getAllSummaries())
    .filter((h) => h.isFeatured)
    .sort((a, b) => b.reviewScore - a.reviewScore)
    .slice(0, limit);
}

export async function getHotelOffers(limit = 3): Promise<HotelSummary[]> {
  return (await getAllSummaries())
    .filter((h) => h.offer)
    .sort((a, b) => (b.offer?.discountPercent ?? 0) - (a.offer?.discountPercent ?? 0) || b.reviewScore - a.reviewScore)
    .slice(0, limit);
}

export async function getHotelsByDestination(destinationSlug: string, limit = 6): Promise<HotelSummary[]> {
  return (await getAllSummaries())
    .filter((h) => h.destination.slug === destinationSlug)
    .sort((a, b) => b.reviewScore - a.reviewScore)
    .slice(0, limit);
}

export type HotelDetail = Hotel &
  Pick<HotelSummary, "destination" | "amenities" | "priceFrom" | "hasAvailability"> & {
    destinationInfo: Destination;
    rooms: Room[];
    reviews: Review[];
  };

const DETAIL_SELECT = `*,
  destination:destinations(*),
  hotel_images(url, alt, position),
  hotel_amenities(position, amenity:amenities(id, slug, name)),
  rooms(*),
  reviews(*)`;

export async function getHotelBySlug(slug: string): Promise<HotelDetail | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("hotels", `hotel:${slug}`);

  const { data: h, error } = await createPublicClient()
    .from("hotels")
    .select(DETAIL_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Could not load hotel: ${error.message}`);
  if (!h || !h.destination || h.hotel_images.length === 0) return null;

  const rooms: Room[] = h.rooms
    .map((r) => ({
      id: r.id,
      hotelId: r.hotel_id,
      name: r.name,
      description: r.description,
      pricePerNight: Number(r.price_per_night),
      maxGuests: r.max_guests,
      bedInfo: r.bed_info,
      sizeSqm: r.size_sqm ?? 0,
      amenities: r.amenities,
      totalUnits: r.total_units,
      availableUnits: Math.max(0, r.total_units - r.blocked_units),
      imageUrl: r.image_url ?? h.hotel_images[0].url,
    }))
    .sort((a, b) => a.pricePerNight - b.pricePerNight);
  if (rooms.length === 0) return null;

  const amenities = [...h.hotel_amenities]
    .sort((a, b) => a.position - b.position)
    .map((x) => x.amenity)
    .filter((a): a is Amenity => Boolean(a));

  return {
    id: h.id,
    slug: h.slug,
    name: h.name,
    destinationId: h.destination_id,
    city: h.city,
    address: h.address,
    accommodationType: h.accommodation_type,
    starRating: h.star_rating as Hotel["starRating"],
    reviewScore: Number(h.review_score),
    reviewCount: h.review_count,
    popularity: h.popularity,
    shortDescription: h.short_description,
    description: h.description,
    amenityIds: amenities.map((a) => a.id),
    facilities: h.facilities,
    checkInTime: h.check_in_time,
    checkOutTime: h.check_out_time,
    cancellationPolicy: h.cancellation_policy,
    images: [...h.hotel_images].sort((a, b) => a.position - b.position).map(({ url, alt }) => ({ url, alt })),
    isFeatured: h.is_featured,
    offer: h.offer_label ? { label: h.offer_label, discountPercent: h.offer_discount_percent ?? 0 } : null,
    isPublished: h.is_published,
    destination: { slug: h.destination.slug, name: h.destination.name, country: h.destination.country },
    amenities,
    priceFrom: Math.min(...rooms.map((r) => r.pricePerNight)),
    hasAvailability: rooms.some((r) => r.availableUnits > 0),
    destinationInfo: mapDestination(h.destination),
    rooms,
    reviews: [...h.reviews]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((r) => ({
        id: r.id,
        hotelId: r.hotel_id,
        authorName: r.author_name,
        authorCountry: r.author_country ?? "",
        rating: Number(r.rating),
        title: r.title,
        comment: r.comment,
        stayedOn: r.stayed_on ?? r.created_at,
      })),
  };
}

/** Other well-rated hotels in the same destination first, then the best-rated elsewhere. */
export async function getSimilarHotels(hotel: { id: string; destination: { slug: string } }, limit = 3) {
  const all = (await getAllSummaries()).filter((h) => h.id !== hotel.id);
  const same = all.filter((h) => h.destination.slug === hotel.destination.slug);
  const others = all
    .filter((h) => h.destination.slug !== hotel.destination.slug)
    .sort((a, b) => b.reviewScore - a.reviewScore);
  return [...same, ...others].slice(0, limit);
}

/** Cards for specific hotels (e.g. a user's saved list), in the order of `ids`. Unpublished hotels are skipped. */
export async function getHotelsByIds(ids: string[]): Promise<HotelSummary[]> {
  const all = new Map((await getAllSummaries()).map((h) => [h.id, h]));
  return ids.flatMap((id) => all.get(id) ?? []);
}

export async function getHotelSlugs(): Promise<string[]> {
  return (await getAllSummaries()).map((h) => h.slug);
}

export async function getAmenities(): Promise<Amenity[]> {
  "use cache";
  cacheLife("days");
  cacheTag("hotels");
  const { data, error } = await createPublicClient().from("amenities").select("id, slug, name").order("display_order");
  if (error) throw new Error(`Could not load amenities: ${error.message}`);
  return data;
}

/** Destination and hotel names for the search box suggestions. */
export async function getSearchSuggestions(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("hotels", "destinations");
  const supabase = createPublicClient();
  const [d, h] = await Promise.all([
    supabase.from("destinations").select("name"),
    supabase.from("hotels").select("name"),
  ]);
  return [...new Set([...(d.data ?? []), ...(h.data ?? [])].map((x) => x.name))];
}
