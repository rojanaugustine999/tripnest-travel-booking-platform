import { Suspense } from "react";
import Image from "next/image";
import { ArrowRight, BadgePercent, CalendarCheck, Headset, Quote, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { FeatureCard } from "@/components/common/feature-card";
import { RatingStars } from "@/components/common/rating-stars";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { DestinationCard } from "@/features/destinations/components/destination-card";
import { getPopularDestinations } from "@/features/destinations/queries";
import { photos } from "@/features/hotels/data/photos";
import { HotelCard } from "@/features/hotels/components/hotel-card";
import { HotelSearchForm } from "@/features/hotels/components/hotel-search-form";
import { OfferCard } from "@/features/hotels/components/offer-card";
import { SearchFormFallback } from "@/features/hotels/components/search-form-fallback";
import { getFeaturedHotels, getHotelOffers, getSearchSuggestions } from "@/features/hotels/queries";
import { NewsletterForm } from "@/features/marketing/components/newsletter-form";
import { testimonials } from "@/features/marketing/data/testimonials";

const reasons = [
  {
    icon: BadgePercent,
    title: "Transparent pricing",
    description: "See the nightly rate, taxes and fees before you confirm — no surprises at checkout.",
  },
  {
    icon: CalendarCheck,
    title: "Flexible stays",
    description: "Cancellation terms are shown on every hotel, so you can pick the flexibility you need.",
  },
  {
    icon: ShieldCheck,
    title: "Secure accounts",
    description: "Your bookings and saved hotels stay private to your account, protected on the server.",
  },
  {
    icon: Headset,
    title: "Helpful support",
    description: "Questions about a stay? Our team is happy to help before, during and after your trip.",
  },
];

export default async function HomePage() {
  const [suggestions, destinations, featured, offers] = await Promise.all([
    getSearchSuggestions(),
    getPopularDestinations(6),
    getFeaturedHotels(6),
    getHotelOffers(3),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <Image src={photos.heroBeach} alt="" fill preload sizes="100vw" className="-z-20 object-cover" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-950/75 via-navy-950/45 to-navy-950/80"
        />
        <Container className="pt-20 pb-16 sm:pt-28 sm:pb-24 lg:pt-36 lg:pb-32">
          <div className="max-w-3xl animate-fade-up">
            <p className="text-eyebrow text-lagoon-200 uppercase">Hotels · Resorts · Villas</p>
            <h1 className="mt-4 text-h1 text-white sm:text-display">Find your perfect stay, anywhere you travel</h1>
            <p className="mt-5 max-w-2xl text-lead text-white/90">
              Compare hand-picked hotels across India and around the world, choose the right room and book in a few
              simple steps.
            </p>
          </div>
          <div className="mt-10 animate-fade-up [animation-delay:120ms]">
            <Suspense fallback={<SearchFormFallback />}>
              <HotelSearchForm suggestions={suggestions} />
            </Suspense>
          </div>
        </Container>
      </section>

      {/* Popular destinations */}
      <Section>
        <SectionHeading
          eyebrow="Explore"
          title="Popular destinations"
          description="From palm-fringed beaches to Himalayan peaks — places our travellers love right now."
          action={
            <ButtonLink href="/destinations" variant="outline" size="sm">
              All destinations <ArrowRight />
            </ButtonLink>
          }
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      </Section>

      {/* Featured hotels */}
      <Section muted>
        <SectionHeading
          eyebrow="Stay"
          title="Featured hotels"
          description="Top-rated stays chosen for their location, service and guest reviews."
          action={
            <ButtonLink href="/hotels" variant="outline" size="sm">
              Browse all hotels <ArrowRight />
            </ButtonLink>
          }
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      </Section>

      {/* Special offers */}
      <Section>
        <SectionHeading
          eyebrow="Deals"
          title="Special offers"
          description="Limited-time savings on selected hotels. Discounts are already included in the prices shown."
          action={
            <ButtonLink href="/hotels?sort=price-asc" variant="outline" size="sm">
              See best prices <ArrowRight />
            </ButtonLink>
          }
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((hotel) => (
            <OfferCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      </Section>

      {/* Why choose TripNest */}
      <Section muted>
        <SectionHeading
          align="center"
          eyebrow="Why TripNest"
          title="Booking made simple and honest"
          description="Everything you need to choose with confidence, without the clutter."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => (
            <FeatureCard key={reason.title} {...reason} />
          ))}
        </div>
      </Section>

      {/* Testimonials */}
      <Section>
        <SectionHeading align="center" eyebrow="Testimonials" title="What travellers say" />
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="flex flex-col rounded-2xl bg-card p-7 shadow-card ring-1 ring-slate-900/5">
              <Quote className="size-8 text-lagoon-200" aria-hidden="true" />
              <RatingStars rating={t.rating} className="mt-4" />
              <blockquote className="mt-3 flex-1 text-slate-700">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-6 border-t border-border pt-4">
                <p className="font-semibold text-slate-900">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.detail}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* Newsletter */}
      <section className="pb-20">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-navy-900 px-6 py-12 sm:px-12 sm:py-14">
            <div
              aria-hidden="true"
              className="absolute -top-20 -right-20 size-72 rounded-full bg-lagoon-500/25 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-24 -left-16 size-72 rounded-full bg-coral-500/20 blur-3xl"
            />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <h2 className="text-h3 text-white sm:text-h2">Get travel deals in your inbox</h2>
                <p className="mt-3 text-navy-100">
                  Monthly inspiration, new hotels and members-only offers. Unsubscribe any time.
                </p>
              </div>
              <NewsletterForm />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
