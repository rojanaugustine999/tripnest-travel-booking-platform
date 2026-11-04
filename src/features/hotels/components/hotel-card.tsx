import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { HotelSummary } from "@/types/domain";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { RatingStars, ReviewScore } from "@/components/common/rating-stars";
import { SaveHotelButton } from "@/features/saved-hotels/components/save-hotel-button";
import { AmenityIcon } from "./amenity-icon";
import { PriceTag } from "./price-tag";

type HotelCardProps = {
  hotel: HotelSummary;
  /** "grid" for homepage carousels, "list" for search results. */
  layout?: "grid" | "list";
  /** Query string carried to the details page so dates and guests are kept. */
  searchQuery?: string;
  className?: string;
};

const TYPE_LABEL: Record<HotelSummary["accommodationType"], string> = {
  hotel: "Hotel",
  resort: "Resort",
  villa: "Villa",
  boutique: "Boutique hotel",
  apartment: "Apartment",
};

export function HotelCard({ hotel, layout = "grid", searchQuery = "", className }: HotelCardProps) {
  const href = `/hotels/${hotel.slug}${searchQuery}`;
  const isList = layout === "list";
  const shownAmenities = hotel.amenities.slice(0, isList ? 5 : 3);

  return (
    <article
      className={cn(
        // `relative` + the title link's ::after makes the whole card clickable while the save button stays usable.
        "group relative flex overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-slate-900/5 transition-shadow duration-300 hover:shadow-card-hover",
        isList ? "flex-col sm:flex-row" : "flex-col",
        className,
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-muted",
          isList ? "aspect-[4/3] sm:aspect-auto sm:w-72 lg:w-80" : "aspect-[4/3]",
        )}
      >
        <Image
          src={hotel.images[0].url}
          alt={hotel.images[0].alt}
          fill
          sizes={
            isList
              ? "(min-width: 1024px) 320px, (min-width: 640px) 288px, 100vw"
              : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          }
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {hotel.offer && (
          <Badge variant="offer" className="absolute top-3 left-3 h-6 px-2.5">
            {hotel.offer.discountPercent}% off · {hotel.offer.label}
          </Badge>
        )}
        <SaveHotelButton hotelId={hotel.id} hotelName={hotel.name} className="absolute top-3 right-3" />
      </div>

      <div className={cn("flex flex-1 flex-col p-5", isList && "sm:p-6")}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <RatingStars rating={hotel.starRating} />
          <span aria-hidden="true">·</span>
          <span>{TYPE_LABEL[hotel.accommodationType]}</span>
        </div>

        <h3 className="mt-2 font-display text-h4 leading-snug font-bold text-slate-900">
          <Link
            href={href}
            className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-3 focus-visible:after:ring-ring/60"
          >
            {hotel.name}
          </Link>
        </h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          {hotel.city}, {hotel.destination.country}
        </p>

        <ReviewScore score={hotel.reviewScore} reviewCount={hotel.reviewCount} className="mt-3" />

        {isList && <p className="mt-3 line-clamp-2 text-sm text-slate-600">{hotel.shortDescription}</p>}

        <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5" aria-label="Top amenities">
          {shownAmenities.map((amenity) => (
            <li key={amenity.id} className="flex items-center gap-1 text-xs text-slate-600">
              <AmenityIcon slug={amenity.slug} className="size-3.5 text-lagoon-700" />
              {amenity.name}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            {!hotel.hasAvailability && <p className="mb-1 text-xs font-medium text-destructive">Sold out for now</p>}
            <PriceTag price={hotel.priceFrom} offer={hotel.offer} prefix="From" />
          </div>
          <span
            aria-hidden="true"
            className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors group-hover:bg-navy-800"
          >
            View details
          </span>
        </div>
      </div>
    </article>
  );
}
