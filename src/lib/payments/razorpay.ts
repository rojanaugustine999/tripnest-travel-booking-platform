import "server-only";
import { createHmac } from "node:crypto";

/*
 * Razorpay TEST MODE helper (server only).
 *
 * The key secret never leaves the server. Only keys that start with `rzp_test_` are accepted: if a live key
 * (`rzp_live_...`) is ever configured by mistake, payments stay switched off, so real money can never move.
 */

export type RazorpayConfig = { keyId: string; keySecret: string };

export function getRazorpayConfig(): RazorpayConfig | null {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keyId || !keySecret) return null;
  if (!keyId.startsWith("rzp_test_")) return null;
  return { keyId, keySecret };
}

/** Our own signature tying an order to one booking and one amount. The database verifies it again. */
export function bindingToken(secret: string, orderId: string, reference: string, amountPaise: number) {
  return createHmac("sha256", secret).update(`bind|${orderId}|${reference}|${amountPaise}`).digest("hex");
}

/** What Razorpay signs after a successful payment: HMAC-SHA256 of "order_id|payment_id". */
export function paymentSignature(secret: string, orderId: string, paymentId: string) {
  return createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
}

export async function createRazorpayOrder(config: RazorpayConfig, input: { amountPaise: number; receipt: string }) {
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.keyId}:${config.keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amountPaise,
      currency: "INR",
      receipt: input.receipt,
      notes: { reference: input.receipt },
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Razorpay order failed (${response.status})`);
  const order = (await response.json()) as { id?: unknown; amount?: unknown };
  if (typeof order.id !== "string" || !order.id.startsWith("order_") || order.amount !== input.amountPaise) {
    throw new Error("Razorpay returned an unexpected order");
  }
  return { orderId: order.id };
}
