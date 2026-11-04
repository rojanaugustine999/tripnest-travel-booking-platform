import { Suspense } from "react";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthUserId } from "@/lib/auth/session";
import { AuthCard } from "@/features/auth/components/auth-card";
import { FormMessage } from "@/features/auth/components/form-message";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

/** The reset email link signs the user in via /auth/confirm, then lands here. */
async function ResetPasswordContent() {
  const userId = await getAuthUserId();

  if (!userId) {
    return (
      <div className="space-y-5">
        <FormMessage tone="error">
          This page only works from the link in your reset email. The link may have expired — request a new one.
        </FormMessage>
        <ButtonLink href="/forgot-password" className="w-full">
          Request a new link
        </ButtonLink>
      </div>
    );
  }
  return <ResetPasswordForm />;
}

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Choose a new password" description="Pick a strong password you haven't used on TripNest before.">
      <Suspense fallback={<Skeleton className="h-56 w-full rounded-xl" />}>
        <ResetPasswordContent />
      </Suspense>
    </AuthCard>
  );
}
