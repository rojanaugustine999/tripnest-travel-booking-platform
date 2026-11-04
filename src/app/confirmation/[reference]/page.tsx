import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Info } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { AccountPage } from "@/features/account/components/account-page";
import { BookingDetails } from "@/features/bookings/components/booking-details";
import { StatusBadge } from "@/features/bookings/components/status-badge";
import { getMyBooking } from "@/features/bookings/queries";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Booking confirmed", robots: { index: false } };

async function ConfirmationContent({ params }: { params: PageProps<"/confirmation/[reference]">["params"] }) {
  const { reference } = await params;
  await requireUser(`/confirmation/${reference}`);

  // Only ever the signed-in user's own booking.
  const booking = await getMyBooking(reference);
  if (!booking) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-2xl bg-green-50 p-6 text-center ring-1 ring-green-900/10">
        <CheckCircle2 className="mx-auto size-10 text-green-700" aria-hidden="true" />
        <h2 className="mt-3 text-h3">Your demo booking is confirmed</h2>
        <p className="mt-2 text-sm text-green-900">Booking reference</p>
        <p className="font-display text-3xl font-extrabold tracking-wider text-navy-900">{booking.reference}</p>
        <div className="mt-3">
          <StatusBadge status={booking.status} />
        </div>
      </div>

      <div className="flex gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          <strong>Demo booking — no payment was taken</strong> and no real hotel has been contacted. This is not a real
          reservation.
        </p>
      </div>

      <BookingDetails booking={booking} />

      <div className="flex flex-wrap gap-3">
        <ButtonLink href={`/bookings/${booking.reference}`}>Manage this booking</ButtonLink>
        <ButtonLink href="/bookings" variant="outline">
          All my bookings
        </ButtonLink>
        <ButtonLink href="/hotels" variant="ghost">
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
