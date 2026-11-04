import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthCard } from "@/features/auth/components/auth-card";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Log in to see your bookings and saved hotels."
      footer={
        <>
          New to TripNest?{" "}
          <Link href="/register" className="font-semibold text-lagoon-700 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {/* The form reads ?next= and ?error= from the URL, so it renders at request time. */}
      <Suspense fallback={<Skeleton className="h-72 w-full rounded-xl" />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
