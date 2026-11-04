import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { CheckCircle2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { AccountPage } from "@/features/account/components/account-page";
import { PriceBreakdown } from "@/features/bookings/components/price-breakdown";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Booking confirmed", robots: { index: false } };

const longDate = (iso: string) => format(parseISO(iso), "EEE d MMM yyyy");

async function ConfirmationContent({ params }: { params: PageProps<"/confirmation/[reference]">["params"] }) {
  const { reference } = await params;
  await requireUser(`/confirmation/${reference}`);

  // Row Level Security means this only ever returns the signed-in user's own booking.
  const supabase = await createClient();
  const { data: booking } = await supabase
    .from("bookings")
    .select(
      `*, hotel:hotels(name, slug, city, address, check_in_time, check_out_time, cancellation_policy),
       room:rooms(name, bed_info), booking_guests(full_name, email, phone, is_primary, created_at)`,
    )
    .eq("reference", reference.toUpperCase())
    .maybeSingle();
  if (!booking) notFound();

  const guests = [...booking.booking_guests].sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
  const nightly = Number(booking.nightly_price);
  const originalNightly = Number(booking.original_nightly_price);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-2xl bg-green-50 p-6 text-center ring-1 ring-green-900/10">
        <CheckCircle2 className="mx-auto size-10 text-green-700" aria-hidden="true" />
        <h2 className="mt-3 text-h3">Your demo booking is confirmed</h2>
        <p className="mt-2 text-sm text-green-900">Booking reference</p>
        <p className="font-display text-3xl font-extrabold tracking-wider text-navy-900">{booking.reference}</p>
        <Badge variant="muted" className="mt-3 capitalize">
          {booking.status}
        </Badge>
      </div>

      <div className="flex gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          <strong>Demo booking — no payment was taken</strong> and no real hotel has been contacted. This is not a real
          reservation.
        </p>
      </div>

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
            originalNightly,
            nightly,
            nights: booking.nights ?? 0,
            rooms: booking.room_count,
            subtotal: Number(booking.subtotal),
            taxes: Number(booking.taxes),
            fees: Number(booking.fees),
            total: Number(booking.total_amount),
          }}
        />
      </section>

      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/bookings">View my bookings</ButtonLink>
        <ButtonLink href="/hotels" variant="outline">
          Keep exploring
        </ButtonLink>
      </div>
    </div>
  );
}

export default function ConfirmationPage(props: PageProps<"/confirmation/[reference]">) {
  return (
    <AccountPage
      eyebrow="Demo booking"
      title="Booking confirmation"
      description="Keep your reference for your records."
    >
      <ConfirmationContent params={props.params} />
    </AccountPage>
  );
}
