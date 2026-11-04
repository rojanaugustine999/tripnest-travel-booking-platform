import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { AdminPage } from "@/features/admin/components/admin-page";
import { HotelForm } from "@/features/admin/components/hotel-form";
import { getHotelFormOptions } from "@/features/admin/queries";
import type { HotelFormInput } from "@/features/admin/validation";

export const metadata: Metadata = { title: "Admin · Add hotel", robots: { index: false, follow: false } };

const EMPTY: HotelFormInput = {
  name: "",
  slug: "",
  destinationId: "",
  city: "",
  address: "",
  accommodationType: "hotel",
  starRating: 4,
  shortDescription: "",
  description: "",
  facilities: "",
  checkInTime: "14:00",
  checkOutTime: "11:00",
  cancellationPolicy: "Free cancellation up to 48 hours before check-in.",
  isFeatured: false,
  isPublished: false,
  offerLabel: "",
  offerDiscountPercent: "",
  images: [{ url: "", alt: "" }],
  amenityIds: [],
};

async function NewHotelContent() {
  await requireAdmin("/admin/hotels/new");
  const { destinations, amenities } = await getHotelFormOptions();
  return <HotelForm defaults={EMPTY} destinations={destinations} amenities={amenities} />;
}

export default function NewHotelPage() {
  return (
    <AdminPage
      title="Add hotel"
      description="New hotels start as drafts. Add rooms after saving, then publish when ready."
    >
      <NewHotelContent />
    </AdminPage>
  );
}
