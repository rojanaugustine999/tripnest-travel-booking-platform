import Image from "next/image";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { CalendarDays, Users } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { BookingRow } from "../queries";
import { StatusBadge } from "./status-badge";

const shortDate = (iso: string) => format(parseISO(iso), "d MMM yyyy");

/** One row in "My bookings". */
export function BookingCard({ booking }: { booking: BookingRow }) {
  const image = [...(booking.hotel?.hotel_images ?? [])].sort((a, b) => a.position - b.position)[0];

  return (
    <article className="group relative flex overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-slate-900/5 transition-shadow hover:shadow-card-hover">
      <div className="relative hidden w-40 shrink-0 bg-muted sm:block">
        {image && <Image src={image.url} alt={image.alt} fill sizes="160px" className="object-cover" />}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-sm font-semibold tracking-wider text-navy-900">{booking.reference}</p>
          <StatusBadge status={booking.status} />
        </div>
        <h3 className="font-display text-h4 leading-snug font-bold text-slate-900">
          <Link
            href={`/bookings/${booking.reference}`}
            className="outline-none after:absolute after:inset-0 focus-visible:after:rounded-2xl focus-visible:after:ring-3 focus-visible:after:ring-ring/60"
          >
            {booking.hotel?.name ?? "Hotel"}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground">{booking.room?.name ?? "Room"}</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-700">
          <li className="flex items-center gap-1.5">
            <CalendarDays className="size-4 text-lagoon-700" aria-hidden="true" />
            {shortDate(booking.check_in)} → {shortDate(booking.check_out)} · {booking.nights}{" "}
            {booking.nights === 1 ? "night" : "nights"}
          </li>
          <li className="flex items-center gap-1.5">
            <Users className="size-4 text-lagoon-700" aria-hidden="true" />
            {booking.guest_count} {booking.guest_count === 1 ? "guest" : "guests"}
          </li>
        </ul>
        <p className="mt-auto font-display font-bold text-slate-900">{formatPrice(Number(booking.total_amount))}</p>
      </div>
    </article>
  );
}
