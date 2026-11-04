import type { Metadata } from "next";
import { BedDouble, CalendarCheck, Hotel, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { AccountPage } from "@/features/account/components/account-page";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

/** Checked on the server: guests are sent to login, signed-in non-admins get a 404. */
async function AdminContent() {
  const admin = await requireAdmin("/admin");
  const sections = [
    { icon: Hotel, title: "Hotels", text: "Add, edit, publish and archive hotels." },
    { icon: BedDouble, title: "Rooms", text: "Room types, prices, occupancy and availability." },
    { icon: CalendarCheck, title: "Bookings", text: "Review bookings and update their status." },
    { icon: Users, title: "Users", text: "See registered users and manage roles." },
  ];

  return (
    <div className="space-y-6">
      <p className="text-slate-600">
        Signed in as <span className="font-semibold text-slate-900">{admin.email}</span> (administrator).
      </p>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map(({ icon: Icon, title, text }) => (
          <li key={title} className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-900/5">
            <Icon className="size-6 text-lagoon-700" aria-hidden="true" />
            <p className="mt-4 font-display font-semibold text-slate-900">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            <p className="mt-3 text-xs font-medium text-warning">Coming in Phase 9</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AccountPage
      eyebrow="Administration"
      title="Admin dashboard"
      description="Manage TripNest's hotels, rooms, bookings and users."
    >
      <AdminContent />
    </AccountPage>
  );
}
