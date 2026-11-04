import type { Metadata } from "next";
import { AccountPage } from "@/features/account/components/account-page";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Profile", robots: { index: false } };

async function ProfileContent() {
  const profile = await requireUser("/profile");
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("phone, created_at").eq("id", profile.id).maybeSingle();

  return (
    <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-2">
      <section
        aria-labelledby="profile-details"
        className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-900/5"
      >
        <h2 id="profile-details" className="text-h4">
          Your details
        </h2>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          Member since{" "}
          {data?.created_at
            ? new Date(data.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
            : "—"}
          . Account type: <span className="capitalize">{profile.role}</span>.
        </p>
        <ProfileForm defaults={{ fullName: profile.full_name ?? "", phone: data?.phone ?? "" }} email={profile.email} />
      </section>

      <section
        aria-labelledby="password-settings"
        className="h-fit rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-900/5"
      >
        <h2 id="password-settings" className="text-h4">
          Change password
        </h2>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          Choose a new password. You will stay signed in on this device.
        </p>
        <ResetPasswordForm />
      </section>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AccountPage eyebrow="My account" title="Profile" description="Your personal details and account settings.">
      <ProfileContent />
    </AccountPage>
  );
}
