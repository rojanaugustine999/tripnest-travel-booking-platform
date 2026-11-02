import type { HotelOffer } from "@/types/domain";

/** Nightly price after an optional offer discount, rounded to the nearest rupee. */
export function applyOffer(price: number, offer: HotelOffer | null) {
  return offer ? Math.round(price * (1 - offer.discountPercent / 100)) : price;
}
