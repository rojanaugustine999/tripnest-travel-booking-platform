import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

/** Shown while a hotel page loads. Also gives the page the Suspense boundary Cache Components expects. */
export default function HotelLoading() {
  return (
    <Container className="py-8" role="status" aria-label="Loading hotel">
      <Skeleton className="h-4 w-64" />
      <div className="mt-6 space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="mt-8 h-[280px] w-full rounded-2xl sm:h-[420px]" />
      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </Container>
  );
}
