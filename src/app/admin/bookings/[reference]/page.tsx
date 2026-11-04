import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Info } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { AdminPage } from "@/features/admin/components/admin-page";
import { BookingStatusActions } from "@/features/admin/components/booking-status-actions";
import { getAdminBooking } from "@/features/admin/queries";
import { PriceBreakdown } from "@/features/bookings/components/price-breakdown";
import { StatusBadge } from "@/features/bookings/components/status-badge";

export const metadata: Metadata = { title: "Admin · Booking", robots: { index: false, follow: false } };

const longDate = (iso: string) => format(new Date(`${iso}T00:00:00`), "EEE d MMM yyyy");

async function BookingContent({ params }: { params: PageProps<"/admin/bookings/[reference]">["params"] }) {
  const { reference } = await params;
  await requireAdmin(`/admin/bookings/${reference}`);
  const booking = await getAdminBooking(reference);
  if (!booking) notFound();

  const guests = [...booking.booking_guests].sort((a, b) => Number(b.is_primary) - Number(a.is_primary));

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/admin/bookings"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-lagoon-700 hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All bookings
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-2xl font-extrabold tracking-wider text-navy-900">{booking.reference}</p>
        <StatusBadge status={booking.status} />
      </div>
      <div className="flex gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>Demo booking — no payment was taken.</p>
      </div>

      <section aria-labelledby="ab-details" className="rounded-2xl border border-border p-6">
        <h2 id="ab-details" className="text-h4">
          {booking.hotel?.name ?? "Hotel"}
        </h2>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Room</dt>
            <dd className="font-medium text-slate-900">{booking.room?.name ?? "Room"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Guests & rooms</dt>
            <dd className="font-medium text-slate-900">
              {booking.guest_count} guests · {booking.room_count} {booking.room_count === 1 ? "room" : "rooms"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Check-in</dt>
            <dd className="font-medium text-slate-900">{longDate(booking.check_in)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Check-out</dt>
            <dd className="font-medium text-slate-900">{longDate(booking.check_out)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Booked by (account)</dt>
            <dd className="text-slate-900">
              {booking.guest?.full_name ?? "—"} · {booking.guest?.email}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Created</dt>
            <dd className="text-slate-900">{new Date(booking.created_at).toLocaleString("en-IN")}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Guests on the booking</dt>
            <dd className="text-slate-900">
              {guests.map((g) => g.full_name + (g.is_primary ? ` (main, ${g.email ?? "no email"})` : "")).join(", ")}
            </dd>
          </div>
          {booking.special_requests && (
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Special requests</dt>
              <dd className="text-slate-900">{booking.special_requests}</dd>
            </div>
          )}
        </dl>
      </section>

      <section aria-labelledby="ab-price" className="rounded-2xl border border-border p-6">
        <h2 id="ab-price" className="mb-4 text-h4">
          Price snapshot
        </h2>
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

      <section aria-labelledby="ab-status" className="rounded-2xl border border-border p-6">
        <h2 id="ab-status" className="mb-4 text-h4">
          Update status
        </h2>
        <BookingStatusActions
          reference={booking.reference}
          status={booking.status}
          checkIn={booking.check_in}
          today={format(new Date(), "yyyy-MM-dd")}
        />
      </section>
    </div>
  );
}

export default function AdminBookingPage(props: PageProps<"/admin/bookings/[reference]">) {
  return (
    <AdminPage title="Booking details" description="Review the booking and update its status.">
      <BookingContent params={props.params} />
    </AdminPage>
  );
}
