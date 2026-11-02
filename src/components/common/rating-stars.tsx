import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type RatingStarsProps = {
  /** Value from 0 to `max`; halves are rounded to the nearest whole star. */
  rating: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
};

/** Hotel star classification (e.g. 4-star hotel). Read by screen readers as "4 out of 5 stars". */
export function RatingStars({ rating, max = 5, size = "sm", className }: RatingStarsProps) {
  const filled = Math.round(Math.min(Math.max(rating, 0), max));

  return (
    <span role="img" aria-label={`${filled} out of ${max} stars`} className={cn("inline-flex gap-0.5", className)}>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={cn(
            size === "sm" ? "size-3.5" : "size-5",
            i < filled ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200",
          )}
        />
      ))}
    </span>
  );
}

type ReviewScoreProps = {
  /** Guest review score out of 10. */
  score: number;
  reviewCount?: number;
  className?: string;
};

function scoreLabel(score: number) {
  if (score >= 9) return "Exceptional";
  if (score >= 8.5) return "Excellent";
  if (score >= 8) return "Very good";
  if (score >= 7) return "Good";
  return "Pleasant";
}

/** Guest review score badge, e.g. "8.7 Excellent · 1,204 reviews". */
export function ReviewScore({ score, reviewCount, className }: ReviewScoreProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm", className)}>
      <span className="rounded-md rounded-bl-none bg-navy-900 px-1.5 py-0.5 text-xs font-bold text-white">
        {score.toFixed(1)}
      </span>
      <span className="font-semibold text-slate-900">{scoreLabel(score)}</span>
      {reviewCount !== undefined && (
        <span className="text-muted-foreground">· {reviewCount.toLocaleString("en-IN")} reviews</span>
      )}
    </span>
  );
}
