import "server-only";
import { createClient } from "@/lib/supabase/server";

export type BookingPayment = { paymentId: string; amountPaise: number; paidAt: string; isTest: boolean };

/** The test payment recorded for a booking, if any. Row Level Security limits this to the owner (and admins). */
export async function getBookingPayment(bookingId: string): Promise<BookingPayment | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("payment_id, amount_paise, paid_at, is_test")
    .eq("booking_id", bookingId)
    .order("paid_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  // Before the payments migration is applied the table does not exist: treat that as "no payment".
  if (error || !data) return null;
  return {
    paymentId: data.payment_id,
    amountPaise: Number(data.amount_paise),
    paidAt: data.paid_at,
    isTest: data.is_test,
  };
}
