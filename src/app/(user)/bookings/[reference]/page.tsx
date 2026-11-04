import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { AccountPage } from "@/features/account/components/account-page";
import { BookingDetails } from "@/features/bookings/components/booking-details";
import { CancelBookingButton } from "@/features/bookings/components/cancel-booking-button";
import { StatusBadge } from "@/features/bookings/components/status-badge";
import { getMyBooking, isCancellable } from "@/features/bookings/queries";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Booking details", robots: { index: false } };

async function BookingContent({ params }: { params: PageProps<"/bookings/[reference]">["params"] }) {
  const { reference } = await params;
  await requireUser(`/bookings/${reference}`);

  // Only ever the signed-in user's own booking; anyone else's reference is simply "not found".
  const booking = await getMyBooking(reference);
  if (!booking) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/bookings"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-lagoon-700 hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All bookings
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Booking reference</p>
          <p className="font-display text-2xl font-extrabold tracking-wider text-navy-900">{booking.reference}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      <div className="flex gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>Demo booking — no payment was taken and no real hotel was contacted.</p>
      </div>
      {booking.status === "cancelled" && booking.cancelled_at && (
        <p className="text-sm text-muted-foreground">
          Cancelled on {new Date(booking.cancelled_at).toLocaleDateString("en-IN", { dateStyle: "long" })}.
        </p>
      )}
      <BookingDetails booking={booking} />
      {isCancellable(booking) && (
        <CancelBookingButton reference={booking.reference} policy={booking.hotel?.cancellation_policy} />
      )}
    </div>
  );
}

export default function BookingDetailsPage(props: PageProps<"/bookings/[reference]">) {
  return (
    <AccountPage eyebrow="My account" title="Booking details" description="Everything about this stay.">
      <BookingContent params={props.params} />
    </AccountPage>
  );
}
