import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Clock, Coins, Languages, Plane, Landmark } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { EmptyState } from "@/components/common/empty-state";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { DestinationCard } from "@/features/destinations/components/destination-card";
import { getDestinationBySlug, getDestinationSlugs, getRelatedDestinations } from "@/features/destinations/queries";
import { HotelCard } from "@/features/hotels/components/hotel-card";
import { getHotelsByDestination } from "@/features/hotels/queries";

// Prerender every known destination at build time; unknown slugs render the 404 page.
export async function generateStaticParams() {
  return (await getDestinationSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/destinations/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) return { title: "Destination not found" };
  return {
    title: `${destination.name}, ${destination.country}`,
    description: destination.shortDescription,
    openGraph: { images: [destination.imageUrl] },
  };
}

export default async function DestinationPage(props: PageProps<"/destinations/[slug]">) {
  const { slug } = await props.params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) notFound();

  const [hotels, related] = await Promise.all([
    getHotelsByDestination(destination.slug, 6),
    getRelatedDestinations(destination, 3),
  ]);

  const info = [
    { icon: CalendarDays, label: "Best time to visit", value: destination.travelInfo.bestTimeToVisit },
    { icon: Coins, label: "Currency", value: destination.travelInfo.currency },
    { icon: Languages, label: "Language", value: destination.travelInfo.language },
    { icon: Clock, label: "Time zone", value: destination.travelInfo.timezone },
    { icon: Plane, label: "Getting there", value: destination.travelInfo.gettingThere },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative isolate flex min-h-[420px] items-end overflow-hidden sm:min-h-[520px]">
        <Image src={destination.imageUrl} alt="" fill preload sizes="100vw" className="-z-20 object-cover" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950/90 via-navy-950/40 to-navy-950/30"
        />
        <Container className="pt-24 pb-12">
          <Breadcrumbs
            inverted
            items={[
              { label: "Home", href: "/" },
              { label: "Destinations", href: "/destinations" },
              { label: destination.name },
            ]}
          />
          <p className="mt-6 text-eyebrow text-lagoon-200 uppercase">{destination.country}</p>
          <h1 className="mt-2 text-h1 text-white sm:text-display">{destination.name}</h1>
          <p className="mt-4 max-w-2xl text-lead text-white/90">{destination.shortDescription}</p>
        </Container>
      </section>

      {/* About + travel info */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <h2 className="text-h3 sm:text-h2">About {destination.name}</h2>
            <p className="mt-4 text-lead text-slate-600">{destination.description}</p>

            <h2 className="mt-12 text-h3">Popular attractions</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {destination.attractions.map((attraction) => (
                <li key={attraction.name} className="flex gap-4 rounded-2xl border border-border p-5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-lagoon-50 text-lagoon-700">
                    <Landmark className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold">{attraction.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{attraction.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <aside
            aria-labelledby="travel-info"
            className="h-fit rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-900/5 lg:sticky lg:top-24"
          >
            <h2 id="travel-info" className="text-h4">
              Travel information
            </h2>
            <dl className="mt-5 space-y-5">
              {info.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3">
                  <Icon className="mt-0.5 size-5 shrink-0 text-lagoon-700" aria-hidden="true" />
                  <div>
                    <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</dt>
                    <dd className="mt-0.5 text-sm text-slate-800">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </Section>

      {/* Recommended hotels */}
      <Section muted>
        <SectionHeading
          eyebrow="Where to stay"
          title={`Recommended hotels in ${destination.name}`}
          action={
            hotels.length > 0 && (
              <ButtonLink href={`/hotels?destination=${destination.slug}`} variant="outline" size="sm">
                See all {destination.hotelCount} <ArrowRight />
              </ButtonLink>
            )
          }
        />
        {hotels.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Landmark}
            title="Hotels coming soon"
            description={`We're adding stays in ${destination.name}. Explore hotels in other destinations meanwhile.`}
            action={<ButtonLink href="/hotels">Browse all hotels</ButtonLink>}
          />
        )}
      </Section>

      {/* Related destinations */}
      {related.length > 0 && (
        <Section>
          <SectionHeading eyebrow="Keep exploring" title="Related destinations" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((d) => (
              <DestinationCard key={d.id} destination={d} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
