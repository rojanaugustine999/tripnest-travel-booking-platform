import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { AdminPage } from "@/features/admin/components/admin-page";
import { RoomManager, type AdminRoom } from "@/features/admin/components/room-manager";
import { getAdminHotelName, getAdminRooms } from "@/features/admin/queries";

export const metadata: Metadata = { title: "Admin · Rooms", robots: { index: false, follow: false } };

async function RoomsContent({ params }: { params: PageProps<"/admin/hotels/[id]/rooms">["params"] }) {
  const { id } = await params;
  await requireAdmin(`/admin/hotels/${id}/rooms`);
  if (!z.uuid().safeParse(id).success) notFound();

  const [hotel, rows] = await Promise.all([getAdminHotelName(id), getAdminRooms(id)]);
  if (!hotel) notFound();

  const rooms: AdminRoom[] = rows.map((r) => ({
    id: r.id,
    hotelId: r.hotel_id,
    name: r.name,
    description: r.description,
    pricePerNight: Number(r.price_per_night),
    maxGuests: r.max_guests,
    bedInfo: r.bed_info,
    sizeSqm: r.size_sqm ?? 25,
    amenities: r.amenities.join("\n"),
    totalUnits: r.total_units,
    blockedUnits: r.blocked_units,
    imageUrl: r.image_url ?? "",
    isActive: r.is_active,
  }));

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/hotels/${hotel.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-lagoon-700 hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to {hotel.name}
      </Link>
      <RoomManager hotelId={hotel.id} hotelName={hotel.name} rooms={rooms} />
    </div>
  );
}

export default function AdminRoomsPage(props: PageProps<"/admin/hotels/[id]/rooms">) {
  return (
    <AdminPage title="Rooms" description="Room types, prices, occupancy and availability.">
      <RoomsContent params={props.params} />
    </AdminPage>
  );
}
