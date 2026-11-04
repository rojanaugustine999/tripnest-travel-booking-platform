import { formatPrice } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import type { StayPrice } from "../lib/pricing";
import { TAX_RATE } from "../lib/pricing";

/** Room price, nights, rooms, subtotal, taxes, fees and total. */
export function PriceBreakdown({ price, savingLabel }: { price: StayPrice; savingLabel?: string | null }) {
  const saving = (price.originalNightly - price.nightly) * price.nights * price.rooms;
  const nights = `${price.nights} ${price.nights === 1 ? "night" : "nights"}`;
  const rooms = `${price.rooms} ${price.rooms === 1 ? "room" : "rooms"}`;

  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between gap-4">
        <dt className="text-muted-foreground">Room price per night</dt>
        <dd className="text-slate-900">{formatPrice(price.nightly)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-muted-foreground">
          {nights} × {rooms}
        </dt>
        <dd className="text-slate-900">{formatPrice(price.subtotal)}</dd>
      </div>
      {saving > 0 && (
        <div className="flex justify-between gap-4 text-success">
          <dt>You save{savingLabel ? ` (${savingLabel}, already included)` : ""}</dt>
          <dd>{formatPrice(saving)}</dd>
        </div>
      )}
      <div className="flex justify-between gap-4">
        <dt className="text-muted-foreground">Taxes ({Math.round(TAX_RATE * 100)}% GST)</dt>
        <dd className="text-slate-900">{formatPrice(price.taxes)}</dd>
      </div>
      {price.fees > 0 && (
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Fees</dt>
          <dd className="text-slate-900">{formatPrice(price.fees)}</dd>
        </div>
      )}
      <Separator className="my-3" />
      <div className="flex justify-between gap-4 text-base">
        <dt className="font-semibold text-slate-900">Total</dt>
        <dd className="font-display font-bold text-slate-900">{formatPrice(price.total)}</dd>
      </div>
    </dl>
  );
}
