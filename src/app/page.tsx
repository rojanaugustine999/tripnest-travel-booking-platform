import { CalendarCheck, MapPinned, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

// Phase 1 foundation page. The full marketing home page is built in Phase 2.
const pillars = [
  {
    icon: MapPinned,
    title: "Handpicked destinations",
    body: "Curated places and tour packages, each with clear itineraries and inclusions.",
  },
  {
    icon: CalendarCheck,
    title: "Book in minutes",
    body: "Pick your dates and travellers, review the price, and confirm — all in one flow.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by design",
    body: "Your account and bookings are protected, and you manage every trip from your dashboard.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600">
        <div aria-hidden="true" className="absolute -top-24 -right-24 size-96 rounded-full bg-accent-400/20 blur-3xl" />
        <Container className="relative py-24 sm:py-32">
          <p className="text-sm font-semibold tracking-widest text-brand-200 uppercase">Welcome to TripNest</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold text-white sm:text-6xl">
            Your nest for unforgettable journeys
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-brand-100">
            Discover destinations, compare tour packages and book your next trip with confidence.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/packages" variant="accent" size="lg">
              Explore packages
            </ButtonLink>
            <ButtonLink
              href="/destinations"
              variant="outline"
              size="lg"
              className="border-white/30 bg-white/10 text-white hover:border-white hover:text-white"
            >
              View destinations
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-card bg-white p-7 shadow-card">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Icon className="size-6" aria-hidden="true" />
                </div>
                <h2 className="mt-5 text-lg font-bold">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
