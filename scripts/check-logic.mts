/**
 * Checks the pure logic that protects the app, with attacker-style input. No database, no browser.
 *
 *   npm run test:logic
 *
 * Covers: open-redirect guard, price calculation, URL/search parsing, and every Zod schema used by the
 * forms and Server Actions. Exits with code 1 if any check fails.
 */
import { calculateStay } from "../src/features/bookings/lib/pricing";
import { bookingFormSchema, createBookingSchema, stayParamsSchema } from "../src/features/bookings/validation";
import { hotelFormSchema, roomFormSchema, bookingFiltersSchema } from "../src/features/admin/validation";
import { parseHotelSearchParams } from "../src/features/hotels/lib/search-params";
import { applyOffer } from "../src/features/hotels/lib/pricing";
import { profileSchema } from "../src/features/profile/validation";
import { loginSchema, registerSchema, resetPasswordSchema, safeNextPath } from "../src/lib/validations/auth";

let failures = 0;
function check(name: string, passed: boolean, detail = "") {
  if (!passed) failures++;
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}${detail ? `  → ${detail}` : ""}`);
}

const UUID = "123e4567-e89b-42d3-a456-426614174000";

// ---- Open redirects after login ------------------------------------------------------------
for (const bad of [
  "//evil.com",
  "https://evil.com",
  "http://evil.com/x",
  "/\\evil.com",
  "javascript:alert(1)",
  "evil",
  "",
  null,
  undefined,
  "///evil.com",
]) {
  check(
    `safeNextPath refuses ${JSON.stringify(bad)}`,
    safeNextPath(bad as string) === "/dashboard",
    safeNextPath(bad as string),
  );
}
check(
  "safeNextPath keeps a normal internal path",
  safeNextPath("/bookings/TN-ABCD1234?x=1") === "/bookings/TN-ABCD1234?x=1",
);

// ---- Prices (must match the SQL function create_booking) ------------------------------------
const stay = calculateStay({
  pricePerNight: 21000,
  offer: { label: "Early bird", discountPercent: 20 },
  nights: 2,
  rooms: 1,
});
check(
  "price: 21,000 with 20% off, 2 nights -> 16,800/night, 33,600 subtotal, 4,032 tax, 37,632 total",
  stay.nightly === 16800 && stay.subtotal === 33600 && stay.taxes === 4032 && stay.total === 37632,
  JSON.stringify(stay),
);
check(
  "price: no offer, 3 rooms, 4 nights",
  calculateStay({ pricePerNight: 5000, offer: null, nights: 4, rooms: 3 }).total === 5000 * 12 * 1.12,
);
check(
  "offer rounds to the nearest rupee",
  applyOffer(7800, { label: "x", discountPercent: 25 }) === 5850 &&
    applyOffer(999, { label: "x", discountPercent: 15 }) === 849,
);

// ---- Booking URL and action input ----------------------------------------------------------
const base = {
  hotel: "palm-shore",
  room: UUID,
  checkIn: "2030-05-10",
  checkOut: "2030-05-12",
  guests: "2",
  rooms: "1",
};
check("valid stay parameters pass", stayParamsSchema.safeParse(base).success);
for (const [name, over] of [
  ["reversed dates", { checkIn: "2030-05-12", checkOut: "2030-05-10" }],
  ["same-day stay", { checkOut: "2030-05-10" }],
  ["stay over 30 nights", { checkOut: "2030-07-10" }],
  ["more rooms than guests", { guests: "1", rooms: "2" }],
  ["room id that is not a uuid", { room: "1 OR 1=1" }],
  ["impossible date", { checkIn: "2030-02-31" }],
  ["16+ guests", { guests: "17" }],
  ["negative guests", { guests: "-1" }],
] as const) {
  check(`stay parameters reject ${name}`, !stayParamsSchema.safeParse({ ...base, ...over }).success);
}
const goodAction = {
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
};
const parsedAction = createBookingSchema.safeParse({
  ...goodAction,
  totalAmount: 1,
  nightlyPrice: 1,
  status: "completed",
  userId: UUID,
});
check(
  "booking action ignores tampered price/status/user fields",
  parsedAction.success &&
    !("totalAmount" in parsedAction.data) &&
    !("status" in parsedAction.data) &&
    !("userId" in parsedAction.data),
);
check("booking action rejects a bad email", !createBookingSchema.safeParse({ ...goodAction, email: "nope" }).success);
check(
  "booking action rejects a 2,000-character request",
  !createBookingSchema.safeParse({ ...goodAction, specialRequests: "x".repeat(2000) }).success,
);
check(
  "booking action rejects a non-uuid idempotency key",
  !createBookingSchema.safeParse({ ...goodAction, idempotencyKey: "abc" }).success,
);
check(
  "booking form requires the demo acknowledgement",
  !bookingFormSchema.safeParse({ ...goodAction, acceptDemo: false }).success &&
    bookingFormSchema.safeParse({ ...goodAction, acceptDemo: true }).success,
);

// ---- Search URL parsing (untrusted input) --------------------------------------------------
const p = parseHotelSearchParams(
  new URLSearchParams(
    "stars=99,abc,4&page=-5&sort=evil&guests=9999&types=resort,alien&minPrice=9&maxPrice=1&q=" + "a".repeat(500),
  ),
);
check(
  "search parameters: junk is dropped or clamped",
  JSON.stringify(p.stars) === "[4]" &&
    p.page === 1 &&
    p.sort === "recommended" &&
    p.guests === 2 &&
    JSON.stringify(p.types) === '["resort"]' &&
    p.minPrice === 1 &&
    p.maxPrice === 9 &&
    p.q === undefined,
  JSON.stringify(p),
);
const f = bookingFiltersSchema.parse({ status: "hacked", q: "x".repeat(200), page: "abc" });
check("admin booking filters: bad status/page fall back", f.status === undefined && f.page === 1);

// ---- Auth forms ----------------------------------------------------------------------------
check("login rejects an empty password", !loginSchema.safeParse({ email: "a@b.co", password: "" }).success);
check(
  "register rejects weak passwords",
  !registerSchema.safeParse({ fullName: "Asha Rao", email: "a@b.co", password: "short1", confirmPassword: "short1" })
    .success &&
    !registerSchema.safeParse({
      fullName: "Asha Rao",
      email: "a@b.co",
      password: "onlyletters",
      confirmPassword: "onlyletters",
    }).success,
);
check(
  "register accepts a good password",
  registerSchema.safeParse({
    fullName: "Asha Rao",
    email: "a@b.co",
    password: "Passw0rd123",
    confirmPassword: "Passw0rd123",
  }).success,
);
check(
  "reset rejects mismatching passwords",
  !resetPasswordSchema.safeParse({ password: "Passw0rd123", confirmPassword: "Passw0rd124" }).success,
);

// ---- Profile -------------------------------------------------------------------------------
for (const ok of ["", "+91 98765 43210", "(022) 1234-5678", "9876543210"])
  check(
    `profile accepts phone ${JSON.stringify(ok)}`,
    profileSchema.safeParse({ fullName: "Asha Rao", phone: ok }).success,
  );
for (const bad of ["abc", "12", "<script>", "+" + "9".repeat(30)])
  check(
    `profile rejects phone ${JSON.stringify(bad)}`,
    !profileSchema.safeParse({ fullName: "Asha Rao", phone: bad }).success,
  );
check(
  "profile ignores a smuggled role field",
  !("role" in (profileSchema.parse({ fullName: "Asha Rao", phone: "", role: "admin" }) as object)),
);

// ---- Admin forms ---------------------------------------------------------------------------
const hotel = {
  name: "Test Hotel",
  slug: "test-hotel",
  destinationId: UUID,
  city: "Goa",
  address: "1 Beach Road, Goa",
  accommodationType: "hotel",
  starRating: 4,
  shortDescription: "A short description here.",
  description: "A long enough description for the hotel to be valid in the form.",
  facilities: "",
  checkInTime: "14:00",
  checkOutTime: "11:00",
  cancellationPolicy: "Free cancellation.",
  isFeatured: false,
  isPublished: false,
  offerLabel: "",
  offerDiscountPercent: "",
  images: [{ url: "https://images.unsplash.com/photo-1", alt: "Front" }],
  amenityIds: [],
};
check("admin hotel form: valid input passes", hotelFormSchema.safeParse(hotel).success);
for (const [name, over] of [
  ["a slug with spaces/capitals", { slug: "Bad Slug" }],
  ["an offer label without a percentage", { offerLabel: "Sale" }],
  ["a 95% discount", { offerLabel: "Sale", offerDiscountPercent: "95" }],
  ["a javascript: image link", { images: [{ url: "javascript:alert(1)", alt: "x y z" }] }],
  ["an http (not https) image link", { images: [{ url: "http://example.com/a.jpg", alt: "Front" }] }],
  ["no images", { images: [] }],
  ["an unknown accommodation type", { accommodationType: "castle" }],
  ["6 stars", { starRating: 6 }],
] as const) {
  check(`admin hotel form rejects ${name}`, !hotelFormSchema.safeParse({ ...hotel, ...over }).success);
}
const room = {
  hotelId: UUID,
  name: "Deluxe",
  description: "A comfortable deluxe room.",
  pricePerNight: 5000,
  maxGuests: 2,
  bedInfo: "1 king",
  sizeSqm: 25,
  amenities: "",
  totalUnits: 4,
  blockedUnits: 0,
  imageUrl: "",
  isActive: true,
};
check("admin room form: valid input passes", roomFormSchema.safeParse(room).success);
check("admin room form rejects blocked > total", !roomFormSchema.safeParse({ ...room, blockedUnits: 5 }).success);
check(
  "admin room form rejects a negative or tiny price",
  !roomFormSchema.safeParse({ ...room, pricePerNight: -5 }).success &&
    !roomFormSchema.safeParse({ ...room, pricePerNight: 10 }).success,
);

console.log(failures ? `\n${failures} check(s) FAILED.` : "\nAll logic checks passed.");
process.exit(failures ? 1 : 0);
