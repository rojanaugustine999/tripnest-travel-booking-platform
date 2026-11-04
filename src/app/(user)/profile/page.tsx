import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import { AccountPage } from "@/features/account/components/account-page";
import { ComingSoon } from "@/features/account/components/coming-soon";

export const metadata: Metadata = { title: "Profile", robots: { index: false } };

export default function Page() {
  return (
    <AccountPage eyebrow="My account" title="Profile" description="Your personal details and account settings.">
      <ComingSoon
        path="/profile"
        icon={UserRound}
        title="Profile editing is coming soon"
        description="You'll be able to update your name, phone number and photo here."
      />
    </AccountPage>
  );
}
