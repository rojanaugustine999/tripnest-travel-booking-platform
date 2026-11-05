import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { HotelCard } from "@/features/hotels/components/hotel-card";
import { HotelFilters } from "@/features/hotels/components/hotel-filters";
import { HotelSearchForm } from "@/features/hotels/components/hotel-search-form";
import { HotelToolbar } from "@/features/hotels/components/hotel-toolbar";
import { SearchFormFallback } from "@/features/hotels/components/search-form-fallback";
import { parseHotelSearchParams, toHotelSearchQuery } from "@/features/hotels/lib/search-params";
import { getAmenities, getHotels, getSearchSuggestions } from "@/features/hotels/queries";

export const metadata: Metadata = {
  title: "Hotels",
  description: "Search and compare hotels, resorts and villas by price, rating, amenities and availability.",
};

function ResultsSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading hotels" role="status">
      <Skeleton className="h-9 w-64" />
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex flex-col gap-4 rounded-2xl p-4 ring-1 ring-slate-900/5 sm:flex-row">
          <Skeleton className="aspect-[4/3] w-full rounded-xl sm:w-72" />
          <div className="flex-1 space-y-3 py-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Everything that depends on the URL query renders here, inside a Suspense boundary. */
async function HotelResults({ searchParams }: { searchParams: PageProps<"/hotels">["searchParams"] }) {
  const params = parseHotelSearchParams(await searchParams);
  const [results, amenities] = await Promise.all([getHotels(params), getAmenities()]);

  // Dates and party size travel to the details page so the room picker is pre-filled.
  const stayQuery = toHotelSearchQuery({
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    guests: params.guests,
    rooms: params.rooms,
  });

  return (
    <>
      <HotelToolbar amenities={amenities} total={results.total} />
      {results.items.length ? (
        <>
          <h2 className="sr-only">Hotel results</h2>
          <ul className="space-y-6">
            {results.items.map((hotel, index) => (
              <li key={hotel.id}>
                <HotelCard hotel={hotel} layout="list" searchQuery={stayQuery} priority={index === 0} />
              </li>
            ))}
          </ul>
          <Pagination
            className="mt-10"
            page={results.page}
            pageCount={results.pageCount}
            hrefFor={(page) => `/hotels${toHotelSearchQuery({ ...params, page })}`}
          />
        </>
      ) : (
        <EmptyState
          icon={SearchX}
          title="No hotels match your search"
          description="Try removing a filter, widening your price range or searching for a different destination."
          action={<ButtonLink href="/hotels">Clear search and filters</ButtonLink>}
        />
      )}
    </>
  );
}

export default async function HotelsPage(props: PageProps<"/hotels">) {
  const [suggestions, amenities] = await Promise.all([getSearchSuggestions(), getAmenities()]);

  return (
    <>
      <PageHeader
        eyebrow="Hotels"
        title="Find a place to stay"
        description="Compare prices, ratings and amenities. All prices are per room per night and include current offers."
      >
        <Suspense fallback={<SearchFormFallback variant="bar" />}>
          <HotelSearchForm suggestions={suggestions} variant="bar" />
        </Suspense>
      </PageHeader>

      <Container className="py-10 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside aria-label="Filters" className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 pb-6">
              <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
                <HotelFilters amenities={amenities} />
              </Suspense>
            </div>
          </aside>
          <section aria-label="Search results">
            <Suspense fallback={<ResultsSkeleton />}>
              <HotelResults searchParams={props.searchParams} />
            </Suspense>
          </section>
        </div>
      </Container>
    </>
  );
}
