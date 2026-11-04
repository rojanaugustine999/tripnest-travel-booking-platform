/**
 * Domain types for TripNest. Field names mirror the planned Supabase tables (Phase 4)
 * in camelCase, so switching the data source in Phase 6 does not change the UI.
 */

export type Attraction = {
  name: string;
  description: string;
};

export type TravelInfo = {
  bestTimeToVisit: string;
  currency: string;
  language: string;
  timezone: string;
  gettingThere: string;
};

/** Table: destinations */
export type Destination = {
  id: string;
  slug: string;
  name: string;
  country: string;
  region: "India" | "Asia" | "Middle East" | "Europe" | "Indian Ocean";
  shortDescription: string;
  description: string;
  imageUrl: string;
  attractions: Attraction[];
  travelInfo: TravelInfo;
  isPopular: boolean;
};

/** Table: amenities */
export type Amenity = {
  id: string;
  slug: string;
  name: string;
};

export type AccommodationType = "hotel" | "resort" | "villa" | "apartment" | "boutique";

/** Table: hotel_images */
export type HotelImage = {
  url: string;
  alt: string;
};

export type HotelOffer = {
  label: string;
  discountPercent: number;
};

/** Table: hotels (+ hotel_amenities as amenityIds) */
export type Hotel = {
  id: string;
  slug: string;
  name: string;
  destinationId: string;
  city: string;
  address: string;
  accommodationType: AccommodationType;
  starRating: 1 | 2 | 3 | 4 | 5;
  /** Average guest review score out of 10. */
  reviewScore: number;
  reviewCount: number;
  /** Proxy for "most popular" sorting (bookings in the last 30 days). */
  popularity: number;
  shortDescription: string;
  description: string;
  amenityIds: string[];
  facilities: string[];
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  images: HotelImage[];
  isFeatured: boolean;
  offer: HotelOffer | null;
  isPublished: boolean;
};

/** Table: rooms (room types) */
export type Room = {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  bedInfo: string;
  sizeSqm: number;
  amenities: string[];
  /** Rooms of this type the hotel has in total. */
  totalUnits: number;
  /** Sample availability; Phase 7 calculates this from bookings for the chosen dates. */
  availableUnits: number;
  imageUrl: string;
};

/** Table: reviews */
export type Review = {
  id: string;
  hotelId: string;
  authorName: string;
  authorCountry: string;
  /** Score out of 10. */
  rating: number;
  title: string;
  comment: string;
  stayedOn: string;
};

/** What listing cards need (one cover image only; no long text). */
export type HotelSummary = Omit<
  Hotel,
  | "description"
  | "address"
  | "facilities"
  | "checkInTime"
  | "checkOutTime"
  | "cancellationPolicy"
  | "amenityIds"
  | "isPublished"
  | "destinationId"
> & {
  destination: Pick<Destination, "slug" | "name" | "country">;
  amenities: Amenity[];
  /** Cheapest room price per night (before offer discount). */
  priceFrom: number;
  hasAvailability: boolean;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageCount: number;
};
