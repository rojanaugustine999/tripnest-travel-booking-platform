import type { Metadata } from "next";
import { CalendarCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { AccountPage } from "@/features/account/components/account-page";
import { BookingCard } from "@/features/bookings/components/booking-card";
import { getMyBookings, isUpcoming, todayIso } from "@/features/bookings/queries";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "My bookings", robots: { index: false } };

async function BookingsContent() {
  await requireUser("/bookings");
  const bookings = await getMyBookings();

  if (bookings.length === 0) {
    return (
      <EmptyState
        icon={CalendarCheck}
        title="No bookings yet"
        description="When you book a stay, it will appear here with its reference and details."
        action={<ButtonLink href="/hotels">Find a hotel</ButtonLink>}
      />
    );
  }

  const today = todayIso();
  const upcoming = bookings.filter((b) => isUpcoming(b, today)).sort((a, b) => a.check_in.localeCompare(b.check_in));
  const past = bookings.filter((b) => !isUpcoming(b, today));

  return (
    <div className="space-y-10">
      <section aria-labelledby="upcoming-bookings">
        <h2 id="upcoming-bookings" className="text-h3">
          Upcoming
        </h2>
        {upcoming.length ? (
          <ul className="mt-5 space-y-5">
            {upcoming.map((b) => (
              <li key={b.id}>
                <BookingCard booking={b} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No upcoming stays.</p>
        )}
      </section>
      {past.length > 0 && (
        <section aria-labelledby="past-bookings">
          <h2 id="past-bookings" className="text-h3">
            Past &amp; cancelled
          </h2>
          <ul className="mt-5 space-y-5">
            {past.map((b) => (
              <li key={b.id}>
                <BookingCard booking={b} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default function BookingsPage() {
  return (
    <AccountPage eyebrow="My account" title="My bookings" description="Your upcoming and past stays.">
      <BookingsContent />
    </AccountPage>
  );
}
