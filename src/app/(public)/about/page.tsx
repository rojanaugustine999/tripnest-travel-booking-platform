import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Compass, Eye, HeartHandshake, Scale } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { FeatureCard } from "@/components/common/feature-card";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { destinations } from "@/features/destinations/data/destinations";
import { hotels } from "@/features/hotels/data/hotels";
import { photos } from "@/features/hotels/data/photos";

export const metadata: Metadata = {
  title: "About us",
  description:
    "TripNest helps travellers discover destinations, compare hotels and book stays with clear, honest information.",
};

const values = [
  {
    icon: Eye,
    title: "Clarity first",
    description: "Prices, policies and room details are shown up front, in plain language.",
  },
  {
    icon: Scale,
    title: "Fair comparison",
    description: "Filters and sorting that really work, so you can compare like for like.",
  },
  {
    icon: HeartHandshake,
    title: "Traveller focused",
    description: "Designed around how people actually plan trips — on any device.",
  },
  {
    icon: Compass,
    title: "Curated choice",
    description: "A smaller set of well-reviewed stays instead of endless listings.",
  },
];

export default function AboutPage() {
  const countries = new Set(destinations.map((d) => d.country)).size;
  const stats = [
    { value: destinations.length, label: "Destinations" },
    { value: hotels.length, label: "Hand-picked hotels" },
    { value: countries, label: "Countries" },
  ];

  return (
    <>
      <PageHeader
        top={<Breadcrumbs inverted items={[{ label: "Home", href: "/" }, { label: "About" }]} />}
        eyebrow="About TripNest"
        title="Making hotel booking simple and honest"
        description="TripNest brings destinations, hotels and rooms together in one clean, easy-to-use experience."
      />

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Our story" title="Built for travellers who like to compare" className="mb-6" />
            <div className="space-y-4 text-slate-600">
              <p>
                Planning a trip often means juggling tabs: one for the destination, another for hotels, another to check
                what a room actually includes. TripNest puts it all in one place — explore a destination, compare hotels
                side by side, pick the right room and see a clear price before you book.
              </p>
              <p>
                TripNest is a portfolio project that demonstrates a complete, full-stack booking platform built with
                Next.js, TypeScript and Supabase. Hotels, prices and reviews shown on the site are realistic sample
                data, and bookings are clearly marked as demo bookings — no real payments or reservations are made.
              </p>
            </div>
            <dl className="mt-8 grid grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-slate-50 p-4 text-center ring-1 ring-slate-900/5">
                  <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                  <dd className="mt-1 font-display text-h2 text-navy-900">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-card-hover">
            <Image
              src={photos.tropicalResortMountains}
              alt="Resort pool surrounded by tropical gardens and mountains"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      <Section muted>
        <SectionHeading align="center" eyebrow="What we value" title="How we design TripNest" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <FeatureCard key={value.title} {...value} />
          ))}
        </div>
      </Section>

      <Section>
        <div className="flex flex-col items-center rounded-3xl bg-navy-900 px-6 py-14 text-center">
          <h2 className="text-h3 text-white sm:text-h2">Ready to find your next stay?</h2>
          <p className="mt-3 max-w-xl text-navy-100">Browse hotels across beaches, mountains and cities.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/hotels" variant="cta" size="lg">
              Browse hotels <ArrowRight />
            </ButtonLink>
            <ButtonLink
              href="/contact"
              variant="outline"
              size="lg"
              className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              Contact us
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
