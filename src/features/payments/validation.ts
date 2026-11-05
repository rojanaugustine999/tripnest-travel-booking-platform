import { z } from "zod";

export const bookingReferenceSchema = z.string().regex(/^TN-[A-Za-z0-9]{8}$/);

/** What the browser sends back after Razorpay's popup succeeds. Everything is verified again in the database. */
export const confirmPaymentSchema = z.object({
  reference: bookingReferenceSchema,
  orderId: z.string().min(5).max(100),
  paymentId: z.string().min(5).max(100),
  signature: z.string().min(10).max(200),
  amountPaise: z.number().int().positive().max(10_000_000_000),
  binding: z.string().min(10).max(200),
});

export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;
