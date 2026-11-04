import { describe, expect, it } from "vitest";
import { calculateStay } from "../src/features/bookings/lib/pricing";
import { createBookingSchema, stayParamsSchema } from "../src/features/bookings/validation";
import { profileSchema } from "../src/features/profile/validation";
import { parseHotelSearchParams } from "../src/features/hotels/lib/search-params";
import { safeNextPath } from "../src/lib/validations/auth";

const UUID = "123e4567-e89b-42d3-a456-426614174000";

describe("safeNextPath (open-redirect guard)", () => {
  it.each(["//evil.com", "https://evil.com", "/\\evil.com", "javascript:alert(1)", "", "///evil.com"])(
    "refuses %j",
    (bad) => expect(safeNextPath(bad)).toBe("/dashboard"),
  );
  it("keeps a normal internal path", () => {
    expect(safeNextPath("/bookings/TN-ABCD1234?x=1")).toBe("/bookings/TN-ABCD1234?x=1");
  });
});

describe("price calculation", () => {
  it("applies offer, then 12% GST", () => {
    const s = calculateStay({
      pricePerNight: 21000,
      offer: { label: "Early bird", discountPercent: 20 },
      nights: 2,
      rooms: 1,
    });
    expect([s.nightly, s.subtotal, s.taxes, s.total]).toEqual([16800, 33600, 4032, 37632]);
  });
});

describe("booking input", () => {
  const base = {
    hotel: "palm-shore",
    room: UUID,
    checkIn: "2030-05-10",
    checkOut: "2030-05-12",
    guests: "2",
    rooms: "1",
  };
  it("accepts valid stay parameters", () => expect(stayParamsSchema.safeParse(base).success).toBe(true));
  it("rejects reversed dates and too many rooms", () => {
    expect(stayParamsSchema.safeParse({ ...base, checkIn: "2030-05-12", checkOut: "2030-05-10" }).success).toBe(false);
    expect(stayParamsSchema.safeParse({ ...base, guests: "1", rooms: "2" }).success).toBe(false);
  });
  it("ignores tampered price, status and user fields", () => {
    const r = createBookingSchema.safeParse({
      roomId: UUID,
      checkIn: "2030-05-10",
      checkOut: "2030-05-12",
      guests: 2,
      rooms: 1,
      idempotencyKey: UUID,
      fullName: "Asha Rao",
      email: "asha@example.test",
      additionalGuests: [],
      phone: "",
      specialRequests: "",
      totalAmount: 1,
      status: "completed",
      userId: UUID,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(Object.keys(r.data)).not.toEqual(expect.arrayContaining(["totalAmount"]));
  });
});

describe("search parameters and profile", () => {
  it("drops or clamps junk search input", () => {
    const p = parseHotelSearchParams(new URLSearchParams("stars=99,abc,4&page=-5&sort=evil&types=resort,alien"));
    expect(p.stars).toEqual([4]);
    expect(p.page).toBe(1);
    expect(p.sort).toBe("recommended");
    expect(p.types).toEqual(["resort"]);
  });
  it("validates phone numbers", () => {
    expect(profileSchema.safeParse({ fullName: "Asha Rao", phone: "(022) 1234-5678" }).success).toBe(true);
    expect(profileSchema.safeParse({ fullName: "Asha Rao", phone: "<script>" }).success).toBe(false);
  });
});
