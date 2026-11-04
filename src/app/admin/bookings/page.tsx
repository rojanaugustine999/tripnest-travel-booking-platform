import type { Metadata } from "next";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { CalendarX2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/common/pagination";
import { requireAdmin } from "@/lib/auth/session";
import { AdminPage } from "@/features/admin/components/admin-page";
import { NativeSelect } from "@/features/admin/components/native-select";
import { getAdminBookings } from "@/features/admin/queries";
import { ADMIN_PAGE_SIZE, BOOKING_STATUS_VALUES, bookingFiltersSchema } from "@/features/admin/validation";
import { StatusBadge } from "@/features/bookings/components/status-badge";

export const metadata: Metadata = { title: "Admin · Bookings", robots: { index: false, follow: false } };

const shortDate = (iso: string) => format(parseISO(iso), "d MMM yyyy");

async function BookingsContent({ searchParams }: { searchParams: PageProps<"/admin/bookings">["searchParams"] }) {
  await requireAdmin("/admin/bookings");
  const raw = await searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const filters = bookingFiltersSchema.parse({ status: first(raw.status), q: first(raw.q), page: first(raw.page) });
  const { items, total } = await getAdminBookings(filters);
  const pageCount = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  const hrefFor = (page: number) => {
    const qs = new URLSearchParams();
    if (filters.status) qs.set("status", filters.status);
    if (filters.q) qs.set("q", filters.q);
    if (page > 1) qs.set("page", String(page));
    const s = qs.toString();
    return `/admin/bookings${s ? `?${s}` : ""}`;
  };

  return (
    <div className="space-y-6">
      {/* A plain GET form: filters live in the URL, no JavaScript needed. */}
      <form method="get" action="/admin/bookings" className="flex flex-wrap items-end gap-3" role="search">
        <div className="grid gap-1.5">
          <label htmlFor="bf-status" className="text-sm font-medium text-slate-800">
            Status
          </label>
          <NativeSelect id="bf-status" name="status" defaultValue={filters.status ?? ""} className="w-44">
            <option value="">All statuses</option>
            {BOOKING_STATUS_VALUES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="bf-q" className="text-sm font-medium text-slate-800">
            Reference
          </label>
          <Input id="bf-q" name="q" defaultValue={filters.q ?? ""} placeholder="TN-…" className="w-44" maxLength={60} />
        </div>
        <Button type="submit">Filter</Button>
        {(filters.status || filters.q) && (
          <Link href="/admin/bookings" className="pb-2 text-sm font-medium text-lagoon-700 hover:underline">
            Clear
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <EmptyState icon={CalendarX2} title="No bookings found" description="Try a different status or reference." />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "booking" : "bookings"} (demo)
          </p>
          <div className="overflow-x-auto rounded-2xl bg-white shadow-card ring-1 ring-slate-900/5">
            <table className="w-full min-w-[760px] text-left text-sm">
              <caption className="sr-only">Bookings</caption>
              <thead className="border-b border-border text-xs text-muted-foreground uppercase">
                <tr>
                  {["Reference", "Guest", "Stay", "Total", "Status"].map((h) => (
                    <th key={h} scope="col" className="px-5 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((b) => (
                  <tr key={b.id}>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/bookings/${b.reference}`}
                        className="font-mono font-semibold text-navy-900 hover:underline"
                      >
                        {b.reference}
                      </Link>
                      <p className="text-xs text-muted-foreground">{shortDate(b.created_at)}</p>
                    </td>
                    <td className="px-5 py-4">
                      {b.guest?.full_name ?? "—"}
                      <span className="block text-xs text-muted-foreground">{b.guest?.email}</span>
                    </td>
                    <td className="px-5 py-4">
                      {b.hotel?.name ?? "Hotel"}
                      <span className="block text-xs text-muted-foreground">
                        {b.room?.name} · {shortDate(b.check_in)} → {shortDate(b.check_out)}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium">{formatPrice(Number(b.total_amount))}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={Math.min(filters.page, pageCount)} pageCount={pageCount} hrefFor={hrefFor} />
        </>
      )}
    </div>
  );
}

export default function AdminBookingsPage(props: PageProps<"/admin/bookings">) {
  return (
    <AdminPage title="Bookings" description="All demo bookings. Open one to review it or change its status.">
      <BookingsContent searchParams={props.searchParams} />
    </AdminPage>
  );
}
