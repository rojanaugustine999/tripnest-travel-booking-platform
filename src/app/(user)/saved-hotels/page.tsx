import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { AccountPage } from "@/features/account/components/account-page";
import { getMySavedHotelIds } from "@/features/bookings/queries";
import { HotelCard } from "@/features/hotels/components/hotel-card";
import { getHotelsByIds } from "@/features/hotels/queries";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Saved hotels", robots: { index: false } };

async function SavedHotelsContent() {
  await requireUser("/saved-hotels");
  const hotels = await getHotelsByIds(await getMySavedHotelIds());

  if (hotels.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="No saved hotels yet"
        description="Tap the heart on any hotel to save it. Your shortlist will appear here."
        action={<ButtonLink href="/hotels">Browse hotels</ButtonLink>}
      />
    );
  }

  return (
    <>
      <p className="mb-6 text-sm text-muted-foreground">
        {hotels.length} saved {hotels.length === 1 ? "hotel" : "hotels"}. Tap the heart again to remove one.
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {hotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>
    </>
  );
}

export default function SavedHotelsPage() {
  return (
    <AccountPage eyebrow="My account" title="Saved hotels" description="Hotels you have shortlisted.">
      <SavedHotelsContent />
    </AccountPage>
  );
}
