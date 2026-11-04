import { cacheLife, cacheTag } from "next/cache";
import type { Destination } from "@/types/domain";
import { createPublicClient } from "@/lib/supabase/public";
import { normalizeText } from "@/lib/utils/text";
import { mapDestination } from "./mappers";

/* Data-access layer for destinations (Phase 6): Supabase as a signed-out visitor, cached and tagged. */

export type DestinationWithCount = Destination & { hotelCount: number };

async function getAll(): Promise<DestinationWithCount[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("destinations");

  const supabase = createPublicClient();
  const [dest, hotels] = await Promise.all([
    supabase.from("destinations").select("*").order("name"),
    supabase.from("hotels").select("destination_id"),
  ]);
  if (dest.error) throw new Error(`Could not load destinations: ${dest.error.message}`);
  const counts = new Map<string, number>();
  for (const h of hotels.data ?? []) counts.set(h.destination_id, (counts.get(h.destination_id) ?? 0) + 1);
  return dest.data.map((row) => ({ ...mapDestination(row), hotelCount: counts.get(row.id) ?? 0 }));
}

export async function getDestinations(query?: string): Promise<DestinationWithCount[]> {
  const q = query ? normalizeText(query.trim()) : "";
  return (await getAll()).filter((d) => !q || normalizeText(`${d.name} ${d.country} ${d.region}`).includes(q));
}

export async function getPopularDestinations(limit = 6): Promise<DestinationWithCount[]> {
  return (await getAll()).filter((d) => d.isPopular).slice(0, limit);
}

export async function getDestinationBySlug(slug: string): Promise<DestinationWithCount | null> {
  return (await getAll()).find((d) => d.slug === slug) ?? null;
}

/** Destinations in the same region first, then popular ones elsewhere. */
export async function getRelatedDestinations(destination: Destination, limit = 3): Promise<DestinationWithCount[]> {
  const others = (await getAll()).filter((d) => d.id !== destination.id);
  const sameRegion = others.filter((d) => d.region === destination.region);
  const rest = others.filter((d) => d.region !== destination.region && d.isPopular);
  return [...sameRegion, ...rest].slice(0, limit);
}

export async function getDestinationSlugs(): Promise<string[]> {
  return (await getAll()).map((d) => d.slug);
}
