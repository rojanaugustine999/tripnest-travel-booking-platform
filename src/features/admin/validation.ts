import { z } from "zod";

/*
 * Admin form rules. They run in the browser for quick feedback and again in the Server Actions;
 * the database functions and table constraints are the final check.
 */

export const ACCOMMODATION_TYPE_VALUES = ["hotel", "resort", "villa", "boutique", "apartment"] as const;

const requiredText = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `${label} must be at least ${min} characters.`)
    .max(max, `${label} must be at most ${max} characters.`);

const httpsUrl = z
  .string()
  .trim()
  .max(500, "URL is too long.")
  .refine((v) => /^https:\/\/[^\s]+$/.test(v), "Use a full https:// image link.");

export const hotelFormSchema = z
  .object({
    id: z.uuid().optional(),
    name: requiredText("Name", 2, 120),
    slug: z
      .string()
      .trim()
      .min(2, "Enter a URL name.")
      .max(80, "URL name is too long.")
      .regex(
        /^[a-z0-9]+(-[a-z0-9]+)*$/,
        "Use lowercase letters, numbers and single dashes (e.g. sunset-beach-resort).",
      ),
    destinationId: z.uuid("Choose a destination."),
    city: requiredText("City", 2, 80),
    address: requiredText("Address", 5, 200),
    accommodationType: z.enum(ACCOMMODATION_TYPE_VALUES),
    starRating: z.number({ error: "Choose a star rating." }).int().min(1).max(5),
    shortDescription: requiredText("Short description", 10, 200),
    description: requiredText("Description", 30, 3000),
    facilities: z.string().trim().max(2000, "Facilities list is too long."),
    checkInTime: z.string().regex(/^\d{2}:\d{2}$/, "Choose a time."),
    checkOutTime: z.string().regex(/^\d{2}:\d{2}$/, "Choose a time."),
    cancellationPolicy: requiredText("Cancellation policy", 5, 300),
    isFeatured: z.boolean(),
    isPublished: z.boolean(),
    offerLabel: z.string().trim().max(60, "Offer label is too long."),
    offerDiscountPercent: z
      .string()
      .trim()
      .refine(
        (v) => v === "" || (/^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 90),
        "Enter 1 to 90, or leave empty.",
      ),
    images: z
      .array(z.object({ url: httpsUrl, alt: requiredText("Description of the image", 3, 160) }))
      .min(1, "Add at least one image.")
      .max(12, "At most 12 images."),
    amenityIds: z.array(z.uuid()).max(30),
  })
  .refine((v) => (v.offerLabel === "") === (v.offerDiscountPercent === ""), {
    path: ["offerLabel"],
    message: "An offer needs both a label and a discount percentage (or neither).",
  });

export type HotelFormInput = z.infer<typeof hotelFormSchema>;

export const roomFormSchema = z
  .object({
    id: z.uuid().optional(),
    hotelId: z.uuid(),
    name: requiredText("Name", 2, 100),
    description: requiredText("Description", 10, 600),
    pricePerNight: z
      .number({ error: "Enter a number." })
      .min(100, "Price must be at least 100.")
      .max(1_000_000, "Price is too high."),
    maxGuests: z.number({ error: "Enter a number." }).int().min(1, "At least 1.").max(16, "At most 16."),
    bedInfo: requiredText("Bed information", 2, 100),
    sizeSqm: z.number({ error: "Enter a number." }).int().min(5, "At least 5 m².").max(1000, "At most 1000 m²."),
    amenities: z.string().trim().max(1000, "Amenity list is too long."),
    totalUnits: z.number({ error: "Enter a number." }).int().min(1, "At least 1.").max(500, "At most 500."),
    blockedUnits: z.number({ error: "Enter a number." }).int().min(0, "Cannot be negative."),
    imageUrl: z.union([z.literal(""), httpsUrl]),
    isActive: z.boolean(),
  })
  .refine((v) => v.blockedUnits <= v.totalUnits, {
    path: ["blockedUnits"],
    message: "Blocked rooms cannot be more than the total rooms.",
  });

export type RoomFormInput = z.infer<typeof roomFormSchema>;

export const BOOKING_STATUS_VALUES = ["pending", "confirmed", "completed", "cancelled"] as const;
export const bookingStatusSchema = z.enum(BOOKING_STATUS_VALUES);

/** Admin bookings list filters (from the URL). Invalid values are ignored. */
export const bookingFiltersSchema = z.object({
  status: bookingStatusSchema.optional().catch(undefined),
  q: z.string().trim().max(60).optional().catch(undefined),
  page: z.coerce.number().int().min(1).catch(1),
});

export type BookingFilters = z.infer<typeof bookingFiltersSchema>;
export const ADMIN_PAGE_SIZE = 15;

/** Splits "one per line" text into a clean list. */
export function splitLines(text: string, max = 40) {
  return text
    .split(/\r?\n|,/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, max);
}
