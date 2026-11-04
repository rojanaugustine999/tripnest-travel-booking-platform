import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Heart, ShieldCheck, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { AccountPage } from "@/features/account/components/account-page";
import { FormMessage } from "@/features/auth/components/form-message";
import { BookingCard } from "@/features/bookings/components/booking-card";
import { getMyBookings, getMySavedHotelIds, isUpcoming, todayIso } from "@/features/bookings/queries";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

const NOTICES: Record<string, string> = {
  "email-confirmed": "Your email is confirmed — welcome to TripNest!",
  "password-updated": "Your password has been updated.",
};

async function DashboardContent({ searchParams }: { searchParams: PageProps<"/dashboard">["searchParams"] }) {
  const [profile, params] = await Promise.all([requireUser("/dashboard"), searchParams]);
  const [bookings, savedIds] = await Promise.all([getMyBookings(), getMySavedHotelIds()]);
  const notice = typeof params.notice === "string" ? NOTICES[params.notice] : undefined;
  const firstName = (profile.full_name || profile.email).split(/[ @]/)[0];

  const today = todayIso();
  const upcoming = bookings.filter((b) => isUpcoming(b, today)).sort((a, b) => a.check_in.localeCompare(b.check_in));
  const nextTrip = upcoming[0];

  const stats = [
    { label: "Upcoming stays", value: upcoming.length, href: "/bookings", icon: CalendarCheck },
    { label: "Total bookings", value: bookings.length, href: "/bookings", icon: CalendarCheck },
    { label: "Saved hotels", value: savedIds.length, href: "/saved-hotels", icon: Heart },
  ];
  const links = [
    { href: "/profile", icon: UserRound, title: "Profile & password", text: "Name, phone and security" },
    ...(profile.role === "admin"
      ? [{ href: "/admin", icon: ShieldCheck, title: "Admin dashboard", text: "Manage hotels and bookings" }]
      : []),
  ];

  return (
    <div className="space-y-10">
      {notice && <FormMessage tone="success">{notice}</FormMessage>}
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-h3">Hello, {firstName}</h2>
        <Badge variant={profile.role === "admin" ? "default" : "soft"} className="capitalize">
          {profile.role}
        </Badge>
      </div>

      <ul className="grid gap-5 sm:grid-cols-3">
        {stats.map(({ label, value, href, icon: Icon }) => (
          <li key={label}>
            <Link
              href={href}
              className="flex h-full items-center gap-4 rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-900/5 transition-shadow hover:shadow-card-hover"
            >
              <Icon className="size-7 text-lagoon-700" aria-hidden="true" />
              <span>
                <span className="block font-display text-3xl leading-none font-extrabold text-slate-900">{value}</span>
                <span className="text-sm text-muted-foreground">{label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <section aria-labelledby="next-trip">
        <h2 id="next-trip" className="text-h4">
          Your next trip
        </h2>
        <div className="mt-4">
          {nextTrip ? (
            <BookingCard booking={nextTrip} />
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="font-display font-semibold text-slate-900">No upcoming trips</p>
              <p className="mt-1 text-sm text-muted-foreground">Find a stay and book it in a couple of minutes.</p>
              <ButtonLink href="/hotels" className="mt-5">
                Find a hotel
              </ButtonLink>
            </div>
          )}
        </div>
      </section>

      <ul className="grid gap-5 sm:grid-cols-2">
        {links.map(({ href, icon: Icon, title, text }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex h-full flex-col rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-900/5 transition-shadow hover:shadow-card-hover"
            >
              <Icon className="size-6 text-lagoon-700" aria-hidden="true" />
              <span className="mt-4 flex items-center gap-1 font-display font-semibold text-slate-900">
                {title}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
              <span className="mt-1 text-sm text-muted-foreground">{text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DashboardPage(props: PageProps<"/dashboard">) {
  return (
    <AccountPage eyebrow="My account" title="Dashboard" description="Everything about your trips, in one place.">
      <DashboardContent searchParams={props.searchParams} />
    </AccountPage>
  );
}
