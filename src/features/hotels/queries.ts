import type { Amenity, Destination, Hotel, HotelSummary, Paginated, Review, Room } from "@/types/domain";
import { destinations } from "@/features/destinations/data/destinations";
import { roomsData } from "@/features/rooms/data/rooms";
import { amenities } from "./data/amenities";
import { hotels } from "./data/hotels";
import { reviews } from "./data/reviews";
import { filterAndSortHotels } from "./lib/filter-hotels";
import type { HotelSearchParams } from "./lib/search-params";

/*
 * Data-access layer for hotels.
 * Phase 3: reads the in-memory sample data. Phase 6: the same functions query Supabase,
 * so pages and components do not change. Functions are async for that reason.
 */

const amenityById = new Map(amenities.map((a) => [a.id, a]));
const destinationById = new Map(destinations.map((d) => [d.id, d]));
const roomsByHotel = roomsData.reduce((map, room) => {
  map.set(room.hotelId, [...(map.get(room.hotelId) ?? []), room]);
  return map;
}, new Map<string, Room[]>());

function toSummary(hotel: Hotel): HotelSummary {
  const destination = destinationById.get(hotel.destinationId)!;
  const rooms = roomsByHotel.get(hotel.id) ?? [];
  return {
    ...hotel,
    destination: { slug: destination.slug, name: destination.name, country: destination.country },
    amenities: hotel.amenityIds.map((id) => amenityById.get(id)).filter((a): a is Amenity => Boolean(a)),
    priceFrom: Math.min(...rooms.map((r) => r.pricePerNight)),
    hasAvailability: rooms.some((r) => r.availableUnits > 0),
  };
}

const publishedSummaries = () => hotels.filter((h) => h.isPublished).map(toSummary);

export async function getHotels(params: HotelSearchParams): Promise<Paginated<HotelSummary>> {
  return filterAndSortHotels(publishedSummaries(), roomsByHotel, params);
}

export async function getFeaturedHotels(limit = 6): Promise<HotelSummary[]> {
  return publishedSummaries()
    .filter((h) => h.isFeatured)
    .sort((a, b) => b.reviewScore - a.reviewScore)
    .slice(0, limit);
}

export async function getHotelOffers(limit = 3): Promise<HotelSummary[]> {
  return publishedSummaries()
    .filter((h) => h.offer)
    .sort((a, b) => (b.offer?.discountPercent ?? 0) - (a.offer?.discountPercent ?? 0) || b.reviewScore - a.reviewScore)
    .slice(0, limit);
}

export async function getHotelsByDestination(destinationId: string, limit = 6): Promise<HotelSummary[]> {
  return publishedSummaries()
    .filter((h) => h.destinationId === destinationId)
    .sort((a, b) => b.reviewScore - a.reviewScore)
    .slice(0, limit);
}

export type HotelDetail = HotelSummary & {
  destinationInfo: Destination;
  rooms: Room[];
  reviews: Review[];
};

export async function getHotelBySlug(slug: string): Promise<HotelDetail | null> {
  const hotel = hotels.find((h) => h.slug === slug && h.isPublished);
  if (!hotel) return null;
  return {
    ...toSummary(hotel),
    destinationInfo: destinationById.get(hotel.destinationId)!,
    rooms: [...(roomsByHotel.get(hotel.id) ?? [])].sort((a, b) => a.pricePerNight - b.pricePerNight),
    reviews: reviews.filter((r) => r.hotelId === hotel.id),
  };
}

/** Other well-rated hotels in the same destination, for "You might also like". */
export async function getSimilarHotels(hotel: Hotel, limit = 3): Promise<HotelSummary[]> {
  const sameDestination = publishedSummaries().filter(
    (h) => h.id !== hotel.id && h.destinationId === hotel.destinationId,
  );
  const others = publishedSummaries().filter((h) => h.id !== hotel.id && h.destinationId !== hotel.destinationId);
  return [...sameDestination, ...others.sort((a, b) => b.reviewScore - a.reviewScore)].slice(0, limit);
}

export async function getHotelSlugs(): Promise<string[]> {
  return hotels.filter((h) => h.isPublished).map((h) => h.slug);
}

export async function getAmenities(): Promise<Amenity[]> {
  return amenities;
}

/** Destination names, cities and hotel names for the search box suggestions. */
export async function getSearchSuggestions(): Promise<string[]> {
  const values = new Set<string>();
  destinations.forEach((d) => values.add(d.name));
  hotels.filter((h) => h.isPublished).forEach((h) => values.add(h.name));
  return [...values];
}
