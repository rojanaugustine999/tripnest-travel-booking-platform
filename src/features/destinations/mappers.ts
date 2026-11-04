import type { Tables } from "@/types/database";
import type { Attraction, Destination, TravelInfo } from "@/types/domain";

/** Database row → the shape the UI uses. */
export function mapDestination(row: Tables<"destinations">): Destination {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    country: row.country,
    region: row.region as Destination["region"],
    shortDescription: row.short_description,
    description: row.description,
    imageUrl: row.image_url,
    attractions: row.attractions as unknown as Attraction[],
    travelInfo: row.travel_info as unknown as TravelInfo,
    isPopular: row.is_popular,
  };
}
