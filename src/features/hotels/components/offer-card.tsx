import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import type { HotelSummary } from "@/types/domain";
import { PriceTag } from "./price-tag";

/** Wide promotional card for the "Special offers" section. */
export function OfferCard({ hotel }: { hotel: HotelSummary }) {
  if (!hotel.offer) return null;

  return (
    <article className="group relative flex overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-slate-900/5 transition-shadow duration-300 hover:shadow-card-hover">
      <div className="relative w-2/5 shrink-0 overflow-hidden bg-muted">
        <Image
          src={hotel.images[0].url}
          alt={hotel.images[0].alt}
          fill
          sizes="(min-width: 1024px) 15vw, 40vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-coral-700">
          <Tag className="size-3.5" aria-hidden="true" />
          {hotel.offer.label}
        </p>
        <p className="mt-1 font-display text-h2 leading-none text-coral-600">
          {hotel.offer.discountPercent}%<span className="ml-1 text-base font-semibold text-slate-700">off</span>
        </p>
        <h3 className="mt-3 font-display text-base leading-snug font-bold text-slate-900">
          <Link
            href={`/hotels/${hotel.slug}`}
            className="outline-none after:absolute after:inset-0 focus-visible:after:rounded-2xl focus-visible:after:ring-3 focus-visible:after:ring-ring/60"
          >
            {hotel.name}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground">
          {hotel.destination.name}, {hotel.destination.country}
        </p>
        <div className="mt-auto flex items-end justify-between pt-4">
          <PriceTag price={hotel.priceFrom} offer={hotel.offer} prefix="From" />
          <ArrowRight
            className="mb-1 size-5 text-navy-700 transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </div>
      </div>
    </article>
  );
}
