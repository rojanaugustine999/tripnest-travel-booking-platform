import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder with the same footprint as HotelSearchForm while it loads (avoids layout shift). */
export function SearchFormFallback({ variant = "hero" }: { variant?: "hero" | "bar" }) {
  const isHero = variant === "hero";
  return (
    <div
      aria-hidden="true"
      className={cn(
        "grid gap-3 rounded-2xl bg-white",
        isHero
          ? "p-5 shadow-2xl ring-1 ring-white/60 sm:p-6 lg:grid-cols-[1.4fr_1.3fr_1fr_auto] lg:items-end"
          : "p-3 shadow-card md:grid-cols-[1.4fr_1.3fr_1fr_auto]",
      )}
    >
      {[0, 1, 2].map((i) => (
        <div key={i} className="grid gap-1.5">
          {isHero && <Skeleton className="h-3 w-24" />}
          <Skeleton className={cn("w-full", isHero ? "h-12" : "h-11")} />
        </div>
      ))}
      <Skeleton className={cn("w-full rounded-full", isHero ? "h-12 lg:w-32" : "h-11")} />
    </div>
  );
}
