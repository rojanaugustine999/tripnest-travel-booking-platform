import { differenceInCalendarDays, isValid, parseISO } from "date-fns";
import { z } from "zod";

/*
 * Booking input rules. The same schemas run in the browser (for quick feedback) and again in the
 * Server Action (the real check). The database function re-checks everything a third time.
 */

export const MAX_NIGHTS = 30;

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date.")
  .refine((value) => isValid(parseISO(value)), "Choose a valid date.");

/** What the booking page needs in its URL to know which stay is being booked. */
export const stayParamsSchema = z
  .object({
    hotel: z.string().trim().min(1).max(80),
    room: z.uuid(),
    checkIn: isoDate,
    checkOut: isoDate,
    guests: z.coerce.number().int().min(1).max(16),
    rooms: z.coerce.number().int().min(1).max(8),
  })
  .refine((v) => v.checkOut > v.checkIn, { message: "Check-out must be after check-in.", path: ["checkOut"] })
  .refine((v) => differenceInCalendarDays(parseISO(v.checkOut), parseISO(v.checkIn)) <= MAX_NIGHTS, {
    message: `You can book up to ${MAX_NIGHTS} nights at a time.`,
    path: ["checkOut"],
  })
  .refine((v) => v.guests >= v.rooms, { message: "You need at least one guest per room.", path: ["rooms"] });

export type StayParams = z.infer<typeof stayParamsSchema>;

const optionalName = z
  .string()
  .trim()
  .max(100, "Name is too long.")
  .refine((v) => v === "" || v.length >= 2, "Enter the guest's full name, or leave it empty.");

/** Fields the traveller fills in. */
export const guestDetailsSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the main guest's full name.").max(100, "Name is too long."),
  email: z.email("Enter a valid email address.").max(254),
  phone: z.string().trim().max(30, "Phone number is too long.").optional(),
  additionalGuests: z.array(z.object({ fullName: optionalName })).max(15),
  specialRequests: z.string().trim().max(1000, "Please keep requests under 1000 characters.").optional(),
});

export type GuestDetailsInput = z.infer<typeof guestDetailsSchema>;

/** Final form (step 2) also needs the demo acknowledgement. */
export const bookingFormSchema = guestDetailsSchema.extend({
  acceptDemo: z.boolean().refine((v) => v === true, "Please confirm that you understand this is a demo booking."),
});

export type BookingFormInput = z.infer<typeof bookingFormSchema>;

/** Everything the Server Action receives. Note: no prices — the server works those out itself. */
export const createBookingSchema = guestDetailsSchema.extend({
  roomId: z.uuid(),
  checkIn: isoDate,
  checkOut: isoDate,
  guests: z.number().int().min(1).max(16),
  rooms: z.number().int().min(1).max(8),
  idempotencyKey: z.uuid(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
