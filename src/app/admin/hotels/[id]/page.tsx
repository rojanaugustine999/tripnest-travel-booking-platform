import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { BedDouble } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { AdminPage } from "@/features/admin/components/admin-page";
import { HotelForm } from "@/features/admin/components/hotel-form";
import { getAdminHotel, getHotelFormOptions } from "@/features/admin/queries";
import type { HotelFormInput } from "@/features/admin/validation";

export const metadata: Metadata = { title: "Admin · Edit hotel", robots: { index: false, follow: false } };

async function EditHotelContent({ params }: { params: PageProps<"/admin/hotels/[id]">["params"] }) {
  const { id } = await params;
  await requireAdmin(`/admin/hotels/${id}`);
  if (!z.uuid().safeParse(id).success) notFound();

  const [hotel, { destinations, amenities }] = await Promise.all([getAdminHotel(id), getHotelFormOptions()]);
  if (!hotel) notFound();

  const defaults: HotelFormInput = {
    id: hotel.id,
    name: hotel.name,
    slug: hotel.slug,
    destinationId: hotel.destination_id,
    city: hotel.city,
    address: hotel.address,
    accommodationType: hotel.accommodation_type,
    starRating: hotel.star_rating,
    shortDescription: hotel.short_description,
    description: hotel.description,
    facilities: hotel.facilities.join("\n"),
    checkInTime: hotel.check_in_time.slice(0, 5),
    checkOutTime: hotel.check_out_time.slice(0, 5),
    cancellationPolicy: hotel.cancellation_policy,
    isFeatured: hotel.is_featured,
    isPublished: hotel.is_published,
    offerLabel: hotel.offer_label ?? "",
    offerDiscountPercent: hotel.offer_discount_percent?.toString() ?? "",
    images: [...hotel.hotel_images].sort((a, b) => a.position - b.position).map(({ url, alt }) => ({ url, alt })),
    amenityIds: [...hotel.hotel_amenities].sort((a, b) => a.position - b.position).map((a) => a.amenity_id),
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-900/5">
        <p className="text-sm text-slate-700">
          Editing <strong>{hotel.name}</strong>
          {hotel.archived_at && " (archived)"}
        </p>
        <ButtonLink href={`/admin/hotels/${hotel.id}/rooms`} variant="outline" size="sm">
          <BedDouble />
          Manage rooms
        </ButtonLink>
      </div>
      <HotelForm defaults={defaults} destinations={destinations} amenities={amenities} />
    </div>
  );
}

export default function EditHotelPage(props: PageProps<"/admin/hotels/[id]">) {
  return (
    <AdminPage title="Edit hotel" description="Changes appear on the public website straight after saving.">
      <EditHotelContent params={props.params} />
    </AdminPage>
  );
}
