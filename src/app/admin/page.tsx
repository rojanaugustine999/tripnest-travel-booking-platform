import type { Metadata } from "next";
import Link from "next/link";
import { BedDouble, CalendarCheck, Hotel, IndianRupee, Info, Users } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth/session";
import { AdminPage } from "@/features/admin/components/admin-page";
import { BookingsByStatusChart, BookingsPerDayChart } from "@/features/admin/components/overview-charts";
import { getAdminStats } from "@/features/admin/queries";
import { StatusBadge } from "@/features/bookings/components/status-badge";
import type { Enums } from "@/types/database";

export const metadata: Metadata = { title: "Admin overview", robots: { index: false, follow: false } };

/** Checked on the server: guests are sent to login, signed-in non-admins get a 404. */
async function OverviewContent() {
  await requireAdmin("/admin");
  const stats = await getAdminStats();

  const cards = [
    { label: "Hotels", value: stats.hotels, note: `${stats.published_hotels} published`, icon: Hotel },
    { label: "Room types", value: stats.rooms, note: "active", icon: BedDouble },
    { label: "Bookings", value: stats.bookings, note: "all time", icon: CalendarCheck },
    { label: "Registered users", value: stats.users, note: "accounts", icon: Users },
    {
      label: "Demo revenue",
      value: formatPrice(Number(stats.demo_revenue)),
      note: "demo bookings only",
      icon: IndianRupee,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          <strong>All bookings and revenue here are demo data.</strong> Payments run in test mode, so these figures do
          not represent real money.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(({ label, value, note, icon: Icon }) => (
          <li key={label} className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-900/5">
            <Icon className="size-5 text-lagoon-700" aria-hidden="true" />
            <p className="mt-3 font-display text-2xl leading-none font-extrabold text-slate-900">{value}</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{label}</p>
            <p className="text-xs text-muted-foreground">{note}</p>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <section aria-labelledby="chart-days" className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-900/5">
          <h2 id="chart-days" className="text-h4">
            Bookings created (last 14 days)
          </h2>
          <div className="mt-4">
            <BookingsPerDayChart data={stats.per_day} />
          </div>
        </section>
        <section
          aria-labelledby="chart-status"
          className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-900/5"
        >
          <h2 id="chart-status" className="text-h4">
            Bookings by status
          </h2>
          <div className="mt-4">
            {stats.by_status.length ? (
              <BookingsByStatusChart data={stats.by_status} />
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">No bookings yet.</p>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section
          aria-labelledby="recent-bookings"
          className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-900/5"
        >
          <h2 id="recent-bookings" className="text-h4">
            Recent bookings
          </h2>
          {stats.recent.length ? (
            <ul className="mt-4 divide-y divide-border">
              {stats.recent.map((b) => (
                <li key={b.reference} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <div>
                    <Link
                      href={`/admin/bookings/${b.reference}`}
                      className="font-mono font-semibold text-navy-900 hover:underline"
                    >
                      {b.reference}
                    </Link>
                    <p className="text-muted-foreground">
                      {b.hotel ?? "Hotel"} · {b.guest_email ?? "guest"}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={b.status as Enums<"booking_status">} />
                    <p className="mt-1 font-medium text-slate-900">{formatPrice(Number(b.total_amount))}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No bookings yet.</p>
          )}
        </section>

        <section
          aria-labelledby="popular-hotels"
          className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-900/5"
        >
          <h2 id="popular-hotels" className="text-h4">
            Popular hotels (by bookings)
          </h2>
          <ol className="mt-4 divide-y divide-border">
            {stats.popular.map((h, index) => (
              <li key={h.slug} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="flex items-center gap-3">
                  <span className="flex size-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                    {index + 1}
                  </span>
                  <span className="font-medium text-slate-900">{h.name}</span>
                </span>
                <span className="text-muted-foreground">
                  {h.bookings} {Number(h.bookings) === 1 ? "booking" : "bookings"}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

export default function AdminPageRoute() {
  return (
    <AdminPage title="Overview" description="How TripNest is doing: inventory, bookings and users at a glance.">
      <OverviewContent />
    </AdminPage>
  );
}
