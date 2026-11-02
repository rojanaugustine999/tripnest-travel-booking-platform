import { z } from "zod";
import type { AccommodationType } from "@/types/domain";

/**
 * Hotel search state lives in the URL (e.g. /hotels?q=goa&stars=4,5&sort=price-asc) so results
 * can be shared, bookmarked and restored with the back button. This module parses that untrusted
 * input safely — invalid values are dropped instead of crashing the page.
 */

export const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest rated" },
  { value: "popular", label: "Most popular" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export const ACCOMMODATION_TYPES: { value: AccommodationType; label: string }[] = [
  { value: "hotel", label: "Hotel" },
  { value: "resort", label: "Resort" },
  { value: "villa", label: "Villa" },
  { value: "boutique", label: "Boutique hotel" },
  { value: "apartment", label: "Apartment" },
];

export const GUEST_RATING_OPTIONS = [
  { value: 9, label: "Exceptional 9+" },
  { value: 8, label: "Very good 8+" },
  { value: 7, label: "Good 7+" },
] as const;

export const HOTELS_PAGE_SIZE = 9;

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

/** Accepts "4,5" or ["4", "5"] and returns a clean list. */
const list = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value) =>
    (Array.isArray(value) ? value : value ? value.split(",") : []).map((v) => v.trim()).filter(Boolean),
  );

const optionalNumber = (min: number, max: number) =>
  z.coerce.number().int().min(min).max(max).optional().catch(undefined);

const hotelSearchSchema = z.object({
  q: z.string().trim().max(80).optional().catch(undefined),
  destination: z.string().trim().max(60).optional().catch(undefined),
  checkIn: z.string().regex(isoDate).optional().catch(undefined),
  checkOut: z.string().regex(isoDate).optional().catch(undefined),
  guests: z.coerce.number().int().min(1).max(16).catch(2),
  rooms: z.coerce.number().int().min(1).max(8).catch(1),
  minPrice: optionalNumber(0, 1_000_000),
  maxPrice: optionalNumber(0, 1_000_000),
  stars: list.transform((v) => v.map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 5)),
  rating: optionalNumber(1, 10),
  amenities: list,
  types: list.transform((v) => v.filter((t): t is AccommodationType => ACCOMMODATION_TYPES.some((a) => a.value === t))),
  available: z
    .string()
    .optional()
    .transform((v) => v === "1" || v === "true"),
  sort: z.enum(SORT_OPTIONS.map((o) => o.value) as [SortOption, ...SortOption[]]).catch("recommended"),
  page: z.coerce.number().int().min(1).catch(1),
});

export type HotelSearchParams = z.infer<typeof hotelSearchSchema>;

type RawSearchParams = Record<string, string | string[] | undefined>;

/** Turns the page's raw `searchParams` (or URLSearchParams) into typed, validated search options. */
export function parseHotelSearchParams(raw: RawSearchParams | URLSearchParams): HotelSearchParams {
  const input: RawSearchParams =
    raw instanceof URLSearchParams ? Object.fromEntries(raw.entries()) : Object.fromEntries(Object.entries(raw));
  // Missing keys should use defaults, so feed `undefined` rather than empty strings.
  for (const key of Object.keys(input)) if (input[key] === "") input[key] = undefined;
  const parsed = hotelSearchSchema.parse(input);
  // Keep the price range sensible if someone swaps min and max.
  if (parsed.minPrice !== undefined && parsed.maxPrice !== undefined && parsed.minPrice > parsed.maxPrice) {
    [parsed.minPrice, parsed.maxPrice] = [parsed.maxPrice, parsed.minPrice];
  }
  return parsed;
}

const DEFAULTS: Partial<Record<keyof HotelSearchParams, unknown>> = {
  guests: 2,
  rooms: 1,
  sort: "recommended",
  page: 1,
  available: false,
};

/** Builds a query string from search options, omitting defaults and empty values. */
export function toHotelSearchQuery(params: Partial<HotelSearchParams>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length) query.set(key, value.join(","));
      continue;
    }
    if (DEFAULTS[key as keyof HotelSearchParams] === value) continue;
    query.set(key, value === true ? "1" : String(value));
  }
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

/** Number of active filters (not counting search text, dates, guests, sort or page). */
export function countActiveFilters(params: HotelSearchParams) {
  return (
    (params.minPrice !== undefined || params.maxPrice !== undefined ? 1 : 0) +
    params.stars.length +
    (params.rating ? 1 : 0) +
    params.amenities.length +
    params.types.length +
    (params.available ? 1 : 0)
  );
}
