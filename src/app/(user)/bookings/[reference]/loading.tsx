import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

/** Shown while booking details load. Also gives the page the Suspense boundary Cache Components expects. */
export default function BookingDetailsLoading() {
  return (
    <Container className="py-12" role="status" aria-label="Loading booking">
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    </Container>
  );
}
