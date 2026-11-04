"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type PerDay = { day: string; count: number };
type ByStatus = { status: string; count: number };

const STATUS_COLOURS: Record<string, string> = {
  confirmed: "var(--color-lagoon-600)",
  pending: "var(--color-navy-700)",
  completed: "var(--color-slate-500)",
  cancelled: "var(--color-coral-500)",
};

const shortDay = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

/** Bookings created per day (last 14 days). The text summary below is for screen readers. */
export function BookingsPerDayChart({ data }: { data: PerDay[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  return (
    <figure>
      <div role="img" aria-label={`Bar chart: ${total} bookings created in the last 14 days`} className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid vertical={false} stroke="var(--color-slate-200)" />
            <XAxis
              dataKey="day"
              tickFormatter={shortDay}
              tickLine={false}
              axisLine={false}
              fontSize={11}
              interval={1}
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={11} />
            <Tooltip
              labelFormatter={(label) => shortDay(String(label))}
              formatter={(v) => [v, "Bookings"]}
              cursor={{ fill: "var(--color-slate-100)" }}
            />
            <Bar dataKey="count" fill="var(--color-lagoon-600)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">{data.map((d) => `${shortDay(d.day)}: ${d.count}`).join(", ")}</figcaption>
    </figure>
  );
}

/** Bookings by status. */
export function BookingsByStatusChart({ data }: { data: ByStatus[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  return (
    <figure>
      <div role="img" aria-label={`Bar chart of ${total} bookings by status`} className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
            <CartesianGrid horizontal={false} stroke="var(--color-slate-200)" />
            <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} fontSize={11} />
            <YAxis type="category" dataKey="status" tickLine={false} axisLine={false} fontSize={12} width={80} />
            <Tooltip formatter={(v) => [v, "Bookings"]} cursor={{ fill: "var(--color-slate-100)" }} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((d) => (
                <Cell key={d.status} fill={STATUS_COLOURS[d.status] ?? "var(--color-slate-500)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">{data.map((d) => `${d.status}: ${d.count}`).join(", ")}</figcaption>
    </figure>
  );
}
