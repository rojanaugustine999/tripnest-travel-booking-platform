import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/features/auth/components/auth-card";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Save hotels, book stays and manage every trip from your dashboard."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-lagoon-700 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <RegisterForm />
      <p className="mt-5 text-xs text-muted-foreground">
        By creating an account you agree that TripNest is a demo project: bookings are simulated and no payment is
        taken.
      </p>
    </AuthCard>
  );
}
