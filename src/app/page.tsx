import { BedDouble, CalendarCheck, MapPinned } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/common/section";
import { FeatureCard } from "@/components/common/feature-card";

// Temporary foundation page. The full marketing homepage (hero search, destinations, hotels, offers…) is Phase 3.
const pillars = [
  {
    icon: MapPinned,
    title: "Discover destinations",
    description: "Explore popular cities and getaways with travel tips and recommended stays.",
  },
  {
    icon: BedDouble,
    title: "Compare hotels and rooms",
    description: "Filter by price, rating and amenities, then compare room types side by side.",
  },
  {
    icon: CalendarCheck,
    title: "Book in a few steps",
    description: "Choose dates, guests and a room, review the price and confirm a demo booking.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-lagoon-800">
        <div aria-hidden="true" className="absolute -top-24 -right-24 size-96 rounded-full bg-coral-500/20 blur-3xl" />
        <Container className="relative py-24 sm:py-32">
          <p className="text-eyebrow text-lagoon-300 uppercase">Welcome to TripNest</p>
          <h1 className="mt-4 max-w-3xl text-h1 text-white sm:text-display">Find your perfect stay</h1>
          <p className="mt-6 max-w-2xl text-lead text-navy-100">
            Discover destinations, compare hotels and book your next trip with confidence.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/hotels" variant="cta" size="lg">
              Explore hotels
            </ButtonLink>
            <ButtonLink
              href="/destinations"
              variant="outline"
              size="lg"
              className="border-white/30 bg-white/10 text-white hover:border-white hover:bg-white/15 hover:text-white"
            >
              View destinations
            </ButtonLink>
          </div>
        </Container>
      </section>

      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <FeatureCard key={pillar.title} {...pillar} />
          ))}
        </div>
      </Section>
    </>
  );
}
