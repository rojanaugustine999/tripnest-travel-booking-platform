/**
 * Generates supabase/seed.sql from the typed sample data in src/features/*\/data,
 * so the database starts with exactly the content the Phase 3 UI shows.
 *
 *   npm run db:seed:generate
 *
 * IDs: sample records use readable ids ("htl-palm-shore"). They are converted to stable UUIDs,
 * so re-generating the seed always produces the same rows.
 */
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { destinations } from "../src/features/destinations/data/destinations";
import { amenities } from "../src/features/hotels/data/amenities";
import { hotels } from "../src/features/hotels/data/hotels";
import { reviews } from "../src/features/hotels/data/reviews";
import { roomsData } from "../src/features/rooms/data/rooms";

/** Deterministic UUID (v5-style layout) derived from a readable sample id. */
function uuidFor(key: string) {
  const hex = createHash("sha1").update(`tripnest:${key}`).digest("hex");
  const variant = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

const text = (value: string | null | undefined) => (value == null ? "null" : `'${value.replace(/'/g, "''")}'`);
const num = (value: number | null | undefined) => (value == null ? "null" : String(value));
const bool = (value: boolean) => (value ? "true" : "false");
const textArray = (values: string[]) =>
  values.length ? `array[${values.map(text).join(", ")}]::text[]` : "'{}'::text[]";
const json = (value: unknown) => `${text(JSON.stringify(value))}::jsonb`;

/** `refresh` lists columns to update when the row already exists (display order only, never content). */
function insert(table: string, columns: string[], rows: string[][], conflict: string, refresh: string[] = []) {
  if (!rows.length) return "";
  const values = rows.map((r) => `  (${r.join(", ")})`).join(",\n");
  const onConflict = refresh.length
    ? `do update set ${refresh.map((c) => `${c} = excluded.${c}`).join(", ")}`
    : "do nothing";
  return `insert into public.${table} (${columns.join(", ")}) values\n${values}\non conflict ${conflict} ${onConflict};\n`;
}

const amenityUuid = new Map(amenities.map((a) => [a.id, uuidFor(a.id)]));

const sections = [
  insert(
    "destinations",
    [
      "id",
      "slug",
      "name",
      "country",
      "region",
      "short_description",
      "description",
      "image_url",
      "attractions",
      "travel_info",
      "is_popular",
    ],
    destinations.map((d) => [
      text(uuidFor(d.id)),
      text(d.slug),
      text(d.name),
      text(d.country),
      text(d.region),
      text(d.shortDescription),
      text(d.description),
      text(d.imageUrl),
      json(d.attractions),
      json(d.travelInfo),
      bool(d.isPopular),
    ]),
    "(id)",
  ),
  insert(
    "amenities",
    ["id", "slug", "name", "display_order"],
    amenities.map((a, i) => [text(amenityUuid.get(a.id)), text(a.slug), text(a.name), num(i + 1)]),
    "(id)",
    ["display_order"],
  ),
  insert(
    "hotels",
    [
      "id",
      "slug",
      "destination_id",
      "name",
      "city",
      "address",
      "accommodation_type",
      "star_rating",
      "review_score",
      "review_count",
      "popularity",
      "short_description",
      "description",
      "facilities",
      "check_in_time",
      "check_out_time",
      "cancellation_policy",
      "is_featured",
      "offer_label",
      "offer_discount_percent",
      "is_published",
    ],
    hotels.map((h) => [
      text(uuidFor(h.id)),
      text(h.slug),
      text(uuidFor(h.destinationId)),
      text(h.name),
      text(h.city),
      text(h.address),
      text(h.accommodationType),
      num(h.starRating),
      num(h.reviewScore),
      num(h.reviewCount),
      num(h.popularity),
      text(h.shortDescription),
      text(h.description),
      textArray(h.facilities),
      text(h.checkInTime),
      text(h.checkOutTime),
      text(h.cancellationPolicy),
      bool(h.isFeatured),
      text(h.offer?.label),
      num(h.offer?.discountPercent),
      bool(h.isPublished),
    ]),
    "(id)",
  ),
  insert(
    "hotel_images",
    ["id", "hotel_id", "url", "alt", "position"],
    hotels.flatMap((h) =>
      h.images.map((img, i) => [
        text(uuidFor(`${h.id}-img${i}`)),
        text(uuidFor(h.id)),
        text(img.url),
        text(img.alt),
        num(i),
      ]),
    ),
    "(id)",
  ),
  insert(
    "hotel_amenities",
    ["hotel_id", "amenity_id", "position"],
    hotels.flatMap((h) => h.amenityIds.map((a, i) => [text(uuidFor(h.id)), text(amenityUuid.get(a)), num(i)])),
    "(hotel_id, amenity_id)",
    ["position"],
  ),
  insert(
    "rooms",
    [
      "id",
      "hotel_id",
      "name",
      "description",
      "price_per_night",
      "max_guests",
      "bed_info",
      "size_sqm",
      "amenities",
      "total_units",
      "blocked_units",
      "image_url",
    ],
    roomsData.map((r) => [
      text(uuidFor(r.id)),
      text(uuidFor(r.hotelId)),
      text(r.name),
      text(r.description),
      num(r.pricePerNight),
      num(r.maxGuests),
      text(r.bedInfo),
      num(r.sizeSqm),
      textArray(r.amenities),
      num(r.totalUnits),
      // Sample "available units" become the units not blocked; booking-based availability comes in Phase 7.
      num(r.totalUnits - r.availableUnits),
      text(r.imageUrl),
    ]),
    "(id)",
  ),
  insert(
    "reviews",
    ["id", "hotel_id", "author_name", "author_country", "rating", "title", "comment", "stayed_on"],
    reviews.map((r) => [
      text(uuidFor(r.id)),
      text(uuidFor(r.hotelId)),
      text(r.authorName),
      text(r.authorCountry),
      num(r.rating),
      text(r.title),
      text(r.comment),
      text(r.stayedOn),
    ]),
    "(id)",
  ),
];

const sql = `-- =====================================================================================
-- TripNest — SAMPLE DATA (fictional hotels, prices and reviews for demonstration only)
-- GENERATED FILE: do not edit by hand. Run \`npm run db:seed:generate\` to rebuild it from
-- src/features/*/data. Safe to run more than once (existing rows are kept; only display order is refreshed).
-- Totals: ${destinations.length} destinations, ${hotels.length} hotels, ${roomsData.length} rooms, ${amenities.length} amenities, ${reviews.length} reviews.
-- =====================================================================================

begin;

${sections.join("\n")}
commit;
`;

const out = join(process.cwd(), "supabase", "seed.sql");
writeFileSync(out, sql);
console.log(`Wrote ${out}`);
