"use server";

import { getAuthUserId } from "@/lib/auth/session";
import { bindingToken, createRazorpayOrder, getRazorpayConfig } from "@/lib/payments/razorpay";
import { createClient } from "@/lib/supabase/server";
import { bookingReferenceSchema, confirmPaymentSchema, type ConfirmPaymentInput } from "./validation";

/** How long an unpaid booking holds its rooms. Must match private.pending_hold() in the database. */
const HOLD_MINUTES = 15;

export type StartPaymentResult =
  | {
      ok: true;
      keyId: string;
      orderId: string;
      amountPaise: number;
      binding: string;
      reference: string;
      description: string;
    }
  | { ok: false; message: string };

/**
 * Creates a Razorpay (test mode) order for the signed-in user's own pending booking. The amount is read from
 * the database, never from the browser.
 */
export async function startPayment(reference: string): Promise<StartPaymentResult> {
  const parsed = bookingReferenceSchema.safeParse(reference);
  if (!parsed.success) return { ok: false, message: "We could not find that booking." };

  const userId = await getAuthUserId();
  if (!userId) return { ok: false, message: "Please log in to pay for your booking." };

  const config = getRazorpayConfig();
  if (!config) return { ok: false, message: "Test payments are not switched on for this demo right now." };

  const supabase = await createClient();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("reference, status, total_amount, created_at")
    .eq("user_id", userId)
    .eq("reference", parsed.data.toUpperCase())
    .maybeSingle();
  if (error || !booking) return { ok: false, message: "We could not find that booking." };

  if (booking.status !== "pending") {
    return {
      ok: false,
      message:
        booking.status === "confirmed"
          ? "This booking is already paid and confirmed."
          : "This booking can no longer be paid. Please make a new booking.",
    };
  }
  if (Date.now() - new Date(booking.created_at).getTime() > HOLD_MINUTES * 60_000) {
    return { ok: false, message: "The payment window for this booking has ended. Please make a new booking." };
  }

  const amountPaise = Math.round(Number(booking.total_amount) * 100);
  try {
    const { orderId } = await createRazorpayOrder(config, { amountPaise, receipt: booking.reference });
    return {
      ok: true,
      keyId: config.keyId,
      orderId,
      amountPaise,
      binding: bindingToken(config.keySecret, orderId, booking.reference, amountPaise),
      reference: booking.reference,
      description: `Booking ${booking.reference} (test mode)`,
    };
  } catch {
    return { ok: false, message: "We could not start the payment. Please try again in a moment." };
  }
}

export type ConfirmPaymentResult = { ok: true; reference: string } | { ok: false; message: string };

const CONFIRM_ERRORS: Record<string, string> = {
  not_signed_in: "Please log in to continue.",
  booking_not_found: "We could not find that booking.",
  payments_not_configured: "Test payments are not switched on for this demo right now.",
  invalid_payment: "We could not verify this payment, so the booking was not confirmed.",
};

/** Hands the signed payment details to the database, which checks every signature before confirming. */
export async function confirmPayment(input: ConfirmPaymentInput): Promise<ConfirmPaymentResult> {
  const parsed = confirmPaymentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: CONFIRM_ERRORS.invalid_payment };
  if (!(await getAuthUserId())) return { ok: false, message: CONFIRM_ERRORS.not_signed_in };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("confirm_booking_payment", {
    p_reference: parsed.data.reference,
    p_order_id: parsed.data.orderId,
    p_payment_id: parsed.data.paymentId,
    p_signature: parsed.data.signature,
    p_amount_paise: parsed.data.amountPaise,
    p_binding: parsed.data.binding,
  });
  if (error) {
    return {
      ok: false,
      message: CONFIRM_ERRORS[error.message] ?? "We could not confirm your payment. Please try again.",
    };
  }

  const result = data as { ok?: boolean; error?: string; reference?: string } | null;
  if (!result?.ok) {
    return {
      ok: false,
      message:
        result?.error === "booking_expired"
          ? `Your test payment was received but the booking (${parsed.data.reference}) had expired and the room was taken. No real money was involved.`
          : "We could not confirm your payment. Please try again.",
    };
  }
  return { ok: true, reference: result.reference ?? parsed.data.reference };
}
