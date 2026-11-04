"use client";

import { TriangleAlert } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/** Shown when loading hotels or destinations fails (for example if the database is unreachable). */
export default function PublicError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <Container className="flex flex-col items-center py-28 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-red-50 text-destructive">
        <TriangleAlert className="size-8" aria-hidden="true" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold sm:text-4xl">We couldn&apos;t load this page</h1>
      <p className="mt-4 max-w-md text-slate-600">
        Something went wrong on our side while fetching the latest information. Please try again in a moment.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={() => retry()}>Try again</Button>
        <ButtonLink href="/" variant="outline">
          Back to home
        </ButtonLink>
      </div>
    </Container>
  );
}
