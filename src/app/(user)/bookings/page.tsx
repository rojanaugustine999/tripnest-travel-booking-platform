import type { Metadata } from "next";
import { CalendarCheck } from "lucide-react";
import { AccountPage } from "@/features/account/components/account-page";
import { ComingSoon } from "@/features/account/components/coming-soon";

export const metadata: Metadata = { title: "My bookings", robots: { index: false } };

export default function Page() {
  return (
    <AccountPage eyebrow="My account" title="My bookings" description="Your upcoming and past stays.">
      <ComingSoon
        path="/bookings"
        icon={CalendarCheck}
        title="No bookings yet"
        description="Your demo bookings will appear here once the booking flow is live."
      />
    </AccountPage>
  );
}
