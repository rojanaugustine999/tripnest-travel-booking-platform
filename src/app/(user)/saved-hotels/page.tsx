import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { AccountPage } from "@/features/account/components/account-page";
import { ComingSoon } from "@/features/account/components/coming-soon";

export const metadata: Metadata = { title: "Saved hotels", robots: { index: false } };

export default function Page() {
  return (
    <AccountPage eyebrow="My account" title="Saved hotels" description="Hotels you have shortlisted.">
      <ComingSoon
        path="/saved-hotels"
        icon={Heart}
        title="No saved hotels yet"
        description="Tap the heart on any hotel to save it — your list will appear here."
      />
    </AccountPage>
  );
}
