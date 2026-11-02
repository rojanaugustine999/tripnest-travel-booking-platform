import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

/** Shown while a destination page loads. Also gives the page the Suspense boundary Cache Components expects. */
export default function DestinationLoading() {
  return (
    <div role="status" aria-label="Loading destination">
      <div className="flex min-h-[420px] items-end bg-navy-900 sm:min-h-[520px]">
        <Container className="space-y-4 pb-12">
          <Skeleton className="h-4 w-48 bg-white/15" />
          <Skeleton className="h-14 w-72 bg-white/15" />
          <Skeleton className="h-5 w-96 max-w-full bg-white/15" />
        </Container>
      </div>
      <Container className="grid gap-10 py-16 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </Container>
    </div>
  );
}
