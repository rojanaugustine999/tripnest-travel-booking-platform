import { Suspense } from "react";
import type { Metadata } from "next";
import { MapPinOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { DestinationCard } from "@/features/destinations/components/destination-card";
import { DestinationSearch } from "@/features/destinations/components/destination-search";
import { getDestinations, getPopularDestinations } from "@/features/destinations/queries";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Explore beaches, mountains and cities in India and around the world, and find hotels in each destination.",
};

function GridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
      ))}
    </div>
  );
}

/** Reads ?q= at request time; everything outside this boundary is prerendered. */
async function DestinationResults({ searchParams }: { searchParams: PageProps<"/destinations">["searchParams"] }) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : undefined;
  const results = await getDestinations(query);

  return (
    <>
      <SectionHeading
        title={query ? `Results for “${query}”` : "All destinations"}
        description={`${results.length} ${results.length === 1 ? "destination" : "destinations"}`}
      />
      {results.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((destination) => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MapPinOff}
          title="No destinations found"
          description="Try a different city or country, for example “Goa”, “Japan” or “Europe”."
        />
      )}
    </>
  );
}

export default async function DestinationsPage(props: PageProps<"/destinations">) {
  const popular = await getPopularDestinations(3);

  return (
    <>
      <PageHeader
        eyebrow="Destinations"
        title="Where will you go next?"
        description="Beaches, mountains, heritage cities and island escapes — each with hand-picked hotels."
      >
        <Suspense fallback={<Skeleton className="h-13 max-w-xl rounded-full" />}>
          <DestinationSearch />
        </Suspense>
      </PageHeader>

      <Section>
        <SectionHeading eyebrow="Trending" title="Popular right now" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((destination) => (
            <DestinationCard key={destination.id} destination={destination} variant="tall" />
          ))}
        </div>
      </Section>

      <Section muted id="all-destinations">
        <Suspense fallback={<GridSkeleton />}>
          <DestinationResults searchParams={props.searchParams} />
        </Suspense>
      </Section>
    </>
  );
}
