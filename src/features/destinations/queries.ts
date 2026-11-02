import type { Destination } from "@/types/domain";
import { hotels } from "@/features/hotels/data/hotels";
import { destinations } from "./data/destinations";
import { normalizeText } from "@/lib/utils/text";

/*
 * Data-access layer for destinations. Phase 3 reads sample data; Phase 6 switches to Supabase
 * behind the same function signatures.
 */

export type DestinationWithCount = Destination & { hotelCount: number };

function withCount(destination: Destination): DestinationWithCount {
  return {
    ...destination,
    hotelCount: hotels.filter((h) => h.isPublished && h.destinationId === destination.id).length,
  };
}

export async function getDestinations(query?: string): Promise<DestinationWithCount[]> {
  const q = query ? normalizeText(query.trim()) : "";
  return destinations
    .filter((d) => !q || normalizeText(`${d.name} ${d.country} ${d.region}`).includes(q))
    .map(withCount);
}

export async function getPopularDestinations(limit = 6): Promise<DestinationWithCount[]> {
  return destinations
    .filter((d) => d.isPopular)
    .slice(0, limit)
    .map(withCount);
}

export async function getDestinationBySlug(slug: string): Promise<DestinationWithCount | null> {
  const destination = destinations.find((d) => d.slug === slug);
  return destination ? withCount(destination) : null;
}

/** Destinations in the same region first, then popular ones elsewhere. */
export async function getRelatedDestinations(destination: Destination, limit = 3): Promise<DestinationWithCount[]> {
  const others = destinations.filter((d) => d.id !== destination.id);
  const sameRegion = others.filter((d) => d.region === destination.region);
  const rest = others.filter((d) => d.region !== destination.region && d.isPopular);
  return [...sameRegion, ...rest].slice(0, limit).map(withCount);
}

export async function getDestinationSlugs(): Promise<string[]> {
  return destinations.map((d) => d.slug);
}
