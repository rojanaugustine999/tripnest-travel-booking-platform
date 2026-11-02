import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { DestinationWithCount } from "../queries";
import { cn } from "@/lib/utils";

type DestinationCardProps = {
  destination: DestinationWithCount;
  /** "tall" for featured homepage tiles, "default" for grids. */
  variant?: "default" | "tall";
  className?: string;
};

export function DestinationCard({ destination, variant = "default", className }: DestinationCardProps) {
  return (
    <article
      className={cn(
        "group relative isolate overflow-hidden rounded-2xl bg-navy-900 shadow-card",
        variant === "tall" ? "aspect-[3/4]" : "aspect-[4/3]",
        className,
      )}
    >
      <Image
        src={destination.imageUrl}
        alt={`${destination.name}, ${destination.country}`}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="-z-10 object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-transparent"
      />

      <div className="flex h-full flex-col justify-end p-5 text-white">
        <p className="text-eyebrow text-lagoon-200 uppercase">{destination.country}</p>
        <h3 className="mt-1 flex items-center gap-1.5 font-display text-h3 text-white">
          <Link
            href={`/destinations/${destination.slug}`}
            className="outline-none after:absolute after:inset-0 focus-visible:after:ring-3 focus-visible:after:ring-ring focus-visible:after:ring-inset"
          >
            {destination.name}
          </Link>
          <ArrowUpRight
            className="size-5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
            aria-hidden="true"
          />
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-white/85">{destination.shortDescription}</p>
        <p className="mt-3 text-xs font-medium text-white/80">
          {destination.hotelCount} {destination.hotelCount === 1 ? "hotel" : "hotels"}
        </p>
      </div>
    </article>
  );
}
