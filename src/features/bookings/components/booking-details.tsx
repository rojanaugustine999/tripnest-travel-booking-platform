import { format, parseISO } from "date-fns";
import type { BookingRow } from "../queries";
import { PriceBreakdown } from "./price-breakdown";

const longDate = (iso: string) => format(parseISO(iso), "EEE d MMM yyyy");

/** Stay, guest and price details of one booking. Used by the confirmation page and the booking details page. */
export function BookingDetails({ booking }: { booking: BookingRow }) {
  const guests = [...booking.booking_guests].sort((a, b) => Number(b.is_primary) - Number(a.is_primary));

  return (
    <>
      <section aria-labelledby="stay-details" className="rounded-2xl border border-border p-6">
        <h3 id="stay-details" className="text-h4">
          {booking.hotel?.name ?? "Hotel"}
        </h3>
        {booking.hotel && <p className="text-sm text-muted-foreground">{booking.hotel.address}</p>}
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Room</dt>
            <dd className="font-medium text-slate-900">
              {booking.room?.name ?? "Room"} {booking.room && `· ${booking.room.bed_info}`}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Guests &amp; rooms</dt>
            <dd className="font-medium text-slate-900">
              {booking.guest_count} {booking.guest_count === 1 ? "guest" : "guests"} · {booking.room_count}{" "}
              {booking.room_count === 1 ? "room" : "rooms"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Check-in</dt>
            <dd className="font-medium text-slate-900">
              {longDate(booking.check_in)}
              {booking.hotel && ` · from ${booking.hotel.check_in_time.slice(0, 5)}`}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Check-out</dt>
            <dd className="font-medium text-slate-900">
              {longDate(booking.check_out)}
              {booking.hotel && ` · until ${booking.hotel.check_out_time.slice(0, 5)}`}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Guests</dt>
            <dd className="text-slate-900">{guests.map((g) => g.full_name).join(", ")}</dd>
          </div>
          {booking.special_requests && (
            <div>
              <dt className="text-muted-foreground">Special requests</dt>
              <dd className="text-slate-900">{booking.special_requests}</dd>
            </div>
          )}
          {booking.hotel && (
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Cancellation</dt>
              <dd className="text-slate-900">{booking.hotel.cancellation_policy}</dd>
            </div>
          )}
        </dl>
      </section>

      <section aria-labelledby="price-details" className="rounded-2xl border border-border p-6">
        <h3 id="price-details" className="mb-4 text-h4">
          Price (saved at the time of booking)
        </h3>
        <PriceBreakdown
          price={{
            originalNightly: Number(booking.original_nightly_price),
            nightly: Number(booking.nightly_price),
            nights: booking.nights ?? 0,
            rooms: booking.room_count,
            subtotal: Number(booking.subtotal),
            taxes: Number(booking.taxes),
            fees: Number(booking.fees),
            total: Number(booking.total_amount),
          }}
        />
      </section>
    </>
  );
}
