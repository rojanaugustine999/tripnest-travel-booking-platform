import type { HotelOffer } from "@/types/domain";
import { cn, formatPrice } from "@/lib/utils";
import { applyOffer } from "../lib/pricing";

type PriceTagProps = {
  price: number;
  offer?: HotelOffer | null;
  /** Text after the amount, e.g. "/ night". */
  suffix?: string;
  prefix?: string;
  align?: "left" | "right";
  className?: string;
};

/** Nightly price with the original price struck through when an offer applies. */
export function PriceTag({ price, offer, suffix = "/ night", prefix, align = "left", className }: PriceTagProps) {
  const final = applyOffer(price, offer ?? null);

  return (
    <div className={cn("flex flex-col", align === "right" ? "items-end text-right" : "items-start", className)}>
      {offer && (
        <span className="text-xs text-muted-foreground line-through">
          <span className="sr-only">Original price </span>
          {formatPrice(price)}
        </span>
      )}
      <p className="leading-tight">
        {prefix && <span className="mr-1 text-xs text-muted-foreground">{prefix}</span>}
        <span className="font-display text-h4 font-bold text-slate-900">{formatPrice(final)}</span>
        <span className="ml-1 text-xs text-muted-foreground">{suffix}</span>
      </p>
    </div>
  );
}
