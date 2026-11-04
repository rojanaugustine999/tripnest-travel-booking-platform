import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Heart, ShieldCheck, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth/session";
import { AccountPage } from "@/features/account/components/account-page";
import { FormMessage } from "@/features/auth/components/form-message";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

const NOTICES: Record<string, string> = {
  "email-confirmed": "Your email is confirmed — welcome to TripNest!",
  "password-updated": "Your password has been updated.",
};

async function DashboardContent({ searchParams }: { searchParams: PageProps<"/dashboard">["searchParams"] }) {
  const [profile, params] = await Promise.all([requireUser("/dashboard"), searchParams]);
  const notice = typeof params.notice === "string" ? NOTICES[params.notice] : undefined;
  const firstName = (profile.full_name || profile.email).split(/[ @]/)[0];

  const links = [
    { href: "/bookings", icon: CalendarCheck, title: "My bookings", text: "Upcoming and past stays" },
    { href: "/saved-hotels", icon: Heart, title: "Saved hotels", text: "Hotels you've shortlisted" },
    { href: "/profile", icon: UserRound, title: "Profile", text: "Name, phone and photo" },
    ...(profile.role === "admin"
      ? [{ href: "/admin", icon: ShieldCheck, title: "Admin dashboard", text: "Manage hotels and bookings" }]
      : []),
  ];

  return (
    <div className="space-y-8">
      {notice && <FormMessage tone="success">{notice}</FormMessage>}
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-h3">Hello, {firstName}</h2>
        <Badge variant={profile.role === "admin" ? "default" : "soft"} className="capitalize">
          {profile.role}
        </Badge>
      </div>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
      <p className="text-sm text-muted-foreground">
        Your full dashboard — booking history, saved hotels and profile editing — arrives in the next phases.
      </p>
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
