import { Suspense } from "react";
import { ArrowRight, BadgePercent, CalendarCheck, Headset, Quote, ShieldCheck, Timer } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { FeatureCard } from "@/components/common/feature-card";
import { RatingStars } from "@/components/common/rating-stars";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { DestinationCard } from "@/features/destinations/components/destination-card";
import { getDestinationSlugs, getPopularDestinations } from "@/features/destinations/queries";
import { HotelCard } from "@/features/hotels/components/hotel-card";
import { HotelSearchForm } from "@/features/hotels/components/hotel-search-form";
import { OfferCard } from "@/features/hotels/components/offer-card";
import { SearchFormFallback } from "@/features/hotels/components/search-form-fallback";
import { getFeaturedHotels, getHotelOffers, getHotelSlugs, getSearchSuggestions } from "@/features/hotels/queries";
import { NewsletterForm } from "@/features/marketing/components/newsletter-form";
import { HeroSlideshow } from "@/features/marketing/components/hero-slideshow";
import { TrustStrip } from "@/features/marketing/components/trust-strip";
import { heroSlides } from "@/features/marketing/data/hero-slides";
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
  const [suggestions, destinations, featured, offers, hotelSlugs, destinationSlugs] = await Promise.all([
    getSearchSuggestions(),
    getPopularDestinations(6),
    getFeaturedHotels(4),
    getHotelOffers(3),
    getHotelSlugs(),
    getDestinationSlugs(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <HeroSlideshow slides={heroSlides} />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-950/75 via-navy-950/55 to-navy-950/80"
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
            <nav
              aria-label="Popular destinations"
              className="mt-5 flex flex-wrap items-center gap-2 text-sm text-white"
            >
              <span className="mr-1 font-medium text-white/80">Popular:</span>
              {destinations.slice(0, 5).map((destination) => (
                <Link
                  key={destination.id}
                  href={`/destinations/${destination.slug}`}
                  className="rounded-full bg-white/15 px-3.5 py-1.5 font-medium backdrop-blur-sm transition-colors hover:bg-white/25 focus-visible:ring-3 focus-visible:ring-white/60 focus-visible:outline-none"
                >
                  {destination.name}
                </Link>
              ))}
            </nav>
          </div>
        </Container>
      </section>

      <TrustStrip hotelCount={hotelSlugs.length} destinationCount={destinationSlugs.length} />

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
        {/* Phones: swipe sideways. Larger screens: a single tidy row. */}
        <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
          {featured.map((hotel) => (
            <li key={hotel.id} className="w-[82%] shrink-0 snap-start sm:w-auto">
              <HotelCard hotel={hotel} className="h-full" />
            </li>
          ))}
        </ul>
      </Section>

      {/* Special offers: a dark band so the deals stand out from the white and grey sections around it. */}
      <section
        aria-labelledby="offers-heading"
        className="relative isolate overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-lagoon-900 py-16 sm:py-20"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 -z-10 size-96 rounded-full bg-coral-500/20 blur-3xl"
        />
        <Container>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-coral-500 px-3 py-1 text-xs font-bold tracking-wide text-white uppercase">
                <Timer className="size-3.5" aria-hidden="true" />
                Limited-time deals
              </p>
              <h2 id="offers-heading" className="text-h3 text-white sm:text-h2">
                Special offers
              </h2>
              <p className="mt-3 text-slate-300">
                Savings on selected hotels, already included in the prices shown. Offers change, so book while they
                last.
              </p>
            </div>
            <ButtonLink
              href="/hotels?sort=price-asc"
              variant="outline"
              size="sm"
              className="shrink-0 border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              See best prices <ArrowRight />
            </ButtonLink>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {offers.map((hotel) => (
              <OfferCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        </Container>
      </section>

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
        <SectionHeading align="center" eyebrow="Sample testimonials" title="What travellers say" />
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
