import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { AdminPage } from "@/features/admin/components/admin-page";
import { HotelRowActions } from "@/features/admin/components/hotel-row-actions";
import { getAdminHotels } from "@/features/admin/queries";

export const metadata: Metadata = { title: "Admin · Hotels", robots: { index: false, follow: false } };

async function HotelsContent() {
  await requireAdmin("/admin/hotels");
  const hotels = await getAdminHotels();

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card ring-1 ring-slate-900/5">
      <table className="w-full min-w-[720px] text-left text-sm">
        <caption className="sr-only">All hotels, including drafts and archived hotels</caption>
        <thead className="border-b border-border text-xs text-muted-foreground uppercase">
          <tr>
            <th scope="col" className="px-5 py-3 font-semibold">
              Hotel
            </th>
            <th scope="col" className="px-5 py-3 font-semibold">
              Status
            </th>
            <th scope="col" className="px-5 py-3 font-semibold">
              Rooms
            </th>
            <th scope="col" className="px-5 py-3 font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {hotels.map((h) => {
            const archived = h.archived_at !== null;
            const roomCount = h.rooms[0]?.count ?? 0;
            return (
              <tr key={h.id} className={archived ? "bg-slate-50 text-muted-foreground" : undefined}>
                <td className="px-5 py-4">
                  <Link href={`/admin/hotels/${h.id}`} className="font-semibold text-slate-900 hover:underline">
                    {h.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {h.city}, {h.destination?.name} · {h.star_rating}★
                  </p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {archived ? (
                      <Badge variant="outline">Archived</Badge>
                    ) : h.is_published ? (
                      <Badge variant="success">Published</Badge>
                    ) : (
                      <Badge variant="muted">Draft</Badge>
                    )}
                    {h.is_featured && <Badge variant="soft">Featured</Badge>}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <Link href={`/admin/hotels/${h.id}/rooms`} className="text-lagoon-700 hover:underline">
                    {roomCount} {roomCount === 1 ? "room type" : "room types"}
                  </Link>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <ButtonLink href={`/admin/hotels/${h.id}`} size="sm" variant="outline">
                      Edit
                    </ButtonLink>
                    <HotelRowActions hotelId={h.id} name={h.name} published={h.is_published} archived={archived} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminHotelsPage() {
  return (
    <AdminPage
      title="Hotels"
      description="Add, edit, publish and archive hotels. Archived hotels disappear from the website but keep their booking history."
      actions={
        <ButtonLink href="/admin/hotels/new">
          <Plus />
          Add hotel
        </ButtonLink>
      }
    >
      <HotelsContent />
    </AdminPage>
  );
}
