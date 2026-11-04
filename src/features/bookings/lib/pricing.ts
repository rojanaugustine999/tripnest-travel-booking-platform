import type { HotelOffer } from "@/types/domain";
import { applyOffer } from "@/features/hotels/lib/pricing";

/** Demo GST rate. Must match `c_tax_rate` in the `create_booking` SQL function. */
export const TAX_RATE = 0.12;

export type StayPrice = {
  originalNightly: number;
  nightly: number;
  nights: number;
  rooms: number;
  subtotal: number;
  taxes: number;
  fees: number;
  total: number;
};

/**
 * Price breakdown shown in the browser. It is only an ESTIMATE for display:
 * the database recalculates the real price when the booking is created, and that price is what is saved.
 */
export function calculateStay(input: {
  pricePerNight: number;
  offer: HotelOffer | null;
  nights: number;
  rooms: number;
}): StayPrice {
  const nightly = applyOffer(input.pricePerNight, input.offer);
  const subtotal = nightly * input.nights * input.rooms;
  const taxes = Math.round(subtotal * TAX_RATE * 100) / 100;
  return {
    originalNightly: input.pricePerNight,
    nightly,
    nights: input.nights,
    rooms: input.rooms,
    subtotal,
    taxes,
    fees: 0,
    total: subtotal + taxes,
  };
}
