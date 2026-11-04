import { Skeleton } from "@/components/ui/skeleton";

/** Gives dynamic admin routes the Suspense boundary Cache Components expects, and a loading state. */
export default function AdminBookingLoading() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-56 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}
