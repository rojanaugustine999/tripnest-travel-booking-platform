import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, Check, LogIn, LogOut, MapPin, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { RatingStars, ReviewScore } from "@/components/common/rating-stars";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { AmenityIcon } from "@/features/hotels/components/amenity-icon";
import { HotelCard } from "@/features/hotels/components/hotel-card";
import { HotelGallery } from "@/features/hotels/components/hotel-gallery";
import { PriceTag } from "@/features/hotels/components/price-tag";
import { getHotelBySlug, getHotelSlugs, getSimilarHotels } from "@/features/hotels/queries";
import { RoomBooking } from "@/features/rooms/components/room-booking";
import { SaveHotelButton } from "@/features/saved-hotels/components/save-hotel-button";

export async function generateStaticParams() {
  return (await getHotelSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/hotels/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const hotel = await getHotelBySlug(slug);
  if (!hotel) return { title: "Hotel not found" };
  return {
    title: `${hotel.name} — ${hotel.destination.name}`,
    description: hotel.shortDescription,
    openGraph: { images: [hotel.images[0].url] },
  };
}

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export default async function HotelPage(props: PageProps<"/hotels/[slug]">) {
  const { slug } = await props.params;
  const hotel = await getHotelBySlug(slug);
  if (!hotel) notFound();

  const similar = await getSimilarHotels(hotel, 3);
  const availableRoomTypes = hotel.rooms.filter((r) => r.availableUnits > 0).length;

  return (
    <>
      <Container className="pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Hotels", href: "/hotels" },
            { label: hotel.destination.name, href: `/hotels?destination=${hotel.destination.slug}` },
            { label: hotel.name },
          ]}
        />

        {/* Overview */}
        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <RatingStars rating={hotel.starRating} size="md" />
              <Badge variant="muted" className="capitalize">
                {hotel.accommodationType}
              </Badge>
              {hotel.offer && (
                <Badge variant="offer">
                  {hotel.offer.discountPercent}% off · {hotel.offer.label}
                </Badge>
              )}
            </div>
            <h1 className="mt-3 text-h2 sm:text-h1">{hotel.name}</h1>
            <p className="mt-2 flex items-start gap-1.5 text-muted-foreground">
              <MapPin className="mt-1 size-4 shrink-0" aria-hidden="true" />
              {hotel.address} ·{" "}
              <Link
                href={`/destinations/${hotel.destination.slug}`}
                className="font-medium text-lagoon-700 hover:underline"
              >
                About {hotel.destination.name}
              </Link>
            </p>
            <ReviewScore score={hotel.reviewScore} reviewCount={hotel.reviewCount} className="mt-3" />
          </div>
          <div className="flex items-center gap-4">
            <PriceTag price={hotel.priceFrom} offer={hotel.offer} prefix="From" align="right" />
            <SaveHotelButton hotelId={hotel.id} hotelName={hotel.name} size="icon" className="ring-1 ring-border" />
            <a
              href="#rooms"
              className="inline-flex h-11 items-center rounded-full bg-cta px-6 text-sm font-semibold text-cta-foreground shadow-sm hover:bg-coral-700"
            >
              See rooms
            </a>
          </div>
        </div>

        <div className="mt-8">
          <HotelGallery images={hotel.images} hotelName={hotel.name} />
        </div>
      </Container>

      {/* Description, amenities, policies */}
      <Section className="pt-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <div>
            <h2 className="text-h3">About this property</h2>
            <p className="mt-4 text-lead text-slate-600">{hotel.description}</p>

            <h2 className="mt-10 text-h3">Amenities</h2>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              {hotel.amenities.map((amenity) => (
                <li key={amenity.id} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <AmenityIcon slug={amenity.slug} className="size-5 text-lagoon-700" />
                  {amenity.name}
                </li>
              ))}
            </ul>

            <h2 className="mt-10 text-h3">Facilities</h2>
            <ul className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {hotel.facilities.map((facility) => (
                <li key={facility} className="flex items-center gap-2 text-sm text-slate-700">
                  <Check className="size-4 text-success" aria-hidden="true" />
                  {facility}
                </li>
              ))}
            </ul>
          </div>

          <aside aria-labelledby="policies" className="h-fit rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-900/5">
            <h2 id="policies" className="text-h4">
              Good to know
            </h2>
            <dl className="mt-5 space-y-5 text-sm">
              <div className="flex gap-3">
                <LogIn className="mt-0.5 size-5 shrink-0 text-lagoon-700" aria-hidden="true" />
                <div>
                  <dt className="font-semibold text-slate-900">Check-in</dt>
                  <dd className="text-slate-600">From {formatTime(hotel.checkInTime)}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <LogOut className="mt-0.5 size-5 shrink-0 text-lagoon-700" aria-hidden="true" />
                <div>
                  <dt className="font-semibold text-slate-900">Check-out</dt>
                  <dd className="text-slate-600">Until {formatTime(hotel.checkOutTime)}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-lagoon-700" aria-hidden="true" />
                <div>
                  <dt className="font-semibold text-slate-900">Cancellation</dt>
                  <dd className="text-slate-600">{hotel.cancellationPolicy}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <CalendarClock className="mt-0.5 size-5 shrink-0 text-lagoon-700" aria-hidden="true" />
                <div>
                  <dt className="font-semibold text-slate-900">Availability</dt>
                  <dd className="text-slate-600">
                    {availableRoomTypes > 0
                      ? `${availableRoomTypes} of ${hotel.rooms.length} room types available for your dates.`
                      : "Fully booked for now. Try different dates."}
                  </dd>
                </div>
              </div>
            </dl>
          </aside>
        </div>
      </Section>

      {/* Rooms */}
      <Section muted id="rooms" className="scroll-mt-16">
        <SectionHeading
          title="Choose your room"
          description="Compare room types, then pick your dates and guests to see the price for your stay."
        />
        <Suspense fallback={<Skeleton className="h-[480px] w-full rounded-2xl" />}>
          <RoomBooking hotelName={hotel.name} rooms={hotel.rooms} offer={hotel.offer} />
        </Suspense>
      </Section>

      {/* Reviews */}
      <Section id="reviews">
        <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
          <div>
            <h2 className="text-h3">Guest reviews</h2>
            <div className="mt-5 rounded-2xl bg-navy-900 p-6 text-white">
              <p className="font-display text-display leading-none">{hotel.reviewScore.toFixed(1)}</p>
              <p className="mt-2 font-semibold">out of 10</p>
              <p className="mt-1 text-sm text-navy-100">
                Based on {hotel.reviewCount.toLocaleString("en-IN")} guest reviews (sample data)
              </p>
            </div>
          </div>
          <ul className="space-y-5">
            {hotel.reviews.map((review) => (
              <li key={review.id} className="rounded-2xl border border-border p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{review.authorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {review.authorCountry} · Stayed{" "}
                      {new Date(review.stayedOn).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <span className="rounded-md rounded-bl-none bg-navy-900 px-2 py-1 text-sm font-bold text-white">
                    {review.rating.toFixed(1)}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-base font-semibold">{review.title}</h3>
                <p className="mt-1 text-slate-600">{review.comment}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Similar hotels */}
      {similar.length > 0 && (
        <Section muted>
          <SectionHeading eyebrow="More stays" title="You might also like" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((h) => (
              <HotelCard key={h.id} hotel={h} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
