import type { HotelSummary, Paginated, Room } from "@/types/domain";
import { HOTELS_PAGE_SIZE, type HotelSearchParams } from "./search-params";
import { applyOffer } from "./pricing";
import { normalizeText } from "@/lib/utils/text";

/** Guests that each room must hold when the party is split across the requested rooms. */
function guestsPerRoom(params: HotelSearchParams) {
  return Math.ceil(params.guests / params.rooms);
}

function hasSuitableRoom(rooms: Room[], params: HotelSearchParams) {
  const needed = guestsPerRoom(params);
  return rooms.some((room) => room.maxGuests >= needed && (!params.available || room.availableUnits >= params.rooms));
}

/** Lowest price shown on the card (after offers) — what price filters and sorting use. */
export function displayPrice(hotel: HotelSummary) {
  return applyOffer(hotel.priceFrom, hotel.offer);
}

function recommendedScore(hotel: HotelSummary) {
  return (
    hotel.reviewScore * 10 + Math.log10(hotel.popularity + 1) * 6 + (hotel.isFeatured ? 6 : 0) + (hotel.offer ? 3 : 0)
  );
}

/**
 * Applies search, filters, sorting and pagination to hotel summaries.
 * Kept pure (no I/O) so the same rules can later be mirrored in SQL and unit tested.
 */
export function filterAndSortHotels(
  hotels: HotelSummary[],
  roomsByHotel: Map<string, Room[]>,
  params: HotelSearchParams,
): Paginated<HotelSummary> {
  const query = params.q ? normalizeText(params.q) : "";

  const filtered = hotels.filter((hotel) => {
    if (query) {
      const haystack = normalizeText(
        [hotel.name, hotel.city, hotel.destination.name, hotel.destination.country].join(" "),
      );
      if (!haystack.includes(query)) return false;
    }
    if (params.destination && hotel.destination.slug !== params.destination) return false;

    const price = displayPrice(hotel);
    if (params.minPrice !== undefined && price < params.minPrice) return false;
    if (params.maxPrice !== undefined && price > params.maxPrice) return false;

    if (params.stars.length && !params.stars.includes(hotel.starRating)) return false;
    if (params.rating && hotel.reviewScore < params.rating) return false;
    if (params.types.length && !params.types.includes(hotel.accommodationType)) return false;
    if (params.amenities.length) {
      const slugs = new Set(hotel.amenities.map((a) => a.slug));
      if (!params.amenities.every((slug) => slugs.has(slug))) return false;
    }

    return hasSuitableRoom(roomsByHotel.get(hotel.id) ?? [], params);
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (params.sort) {
      case "price-asc":
        return displayPrice(a) - displayPrice(b);
      case "price-desc":
        return displayPrice(b) - displayPrice(a);
      case "rating":
        return b.reviewScore - a.reviewScore || b.reviewCount - a.reviewCount;
      case "popular":
        return b.popularity - a.popularity;
      default:
        return recommendedScore(b) - recommendedScore(a);
    }
  });

  const pageCount = Math.max(1, Math.ceil(sorted.length / HOTELS_PAGE_SIZE));
  const page = Math.min(params.page, pageCount);
  const start = (page - 1) * HOTELS_PAGE_SIZE;

  return { items: sorted.slice(start, start + HOTELS_PAGE_SIZE), total: sorted.length, page, pageCount };
}
