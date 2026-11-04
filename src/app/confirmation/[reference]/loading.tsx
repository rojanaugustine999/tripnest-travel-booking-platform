import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

/** Shown while a booking confirmation loads. Also gives the page the Suspense boundary Cache Components expects. */
export default function ConfirmationLoading() {
  return (
    <Container className="py-12" role="status" aria-label="Loading your booking">
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    </Container>
  );
}
