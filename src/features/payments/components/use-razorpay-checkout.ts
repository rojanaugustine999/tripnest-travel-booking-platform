"use client";

import { useCallback, useState } from "react";
import { confirmPayment, startPayment } from "../actions";

/* Minimal typing for the parts of Razorpay's checkout.js that we use. */
type RazorpaySuccess = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };
type RazorpayFailure = { error?: { description?: string } };
type RazorpayInstance = { open: () => void; on: (event: "payment.failed", cb: (r: RazorpayFailure) => void) => void };
type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadCheckoutScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SRC}"]`);
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => resolve(true));
    script.addEventListener("error", () => resolve(false));
    if (!existing) {
      script.src = CHECKOUT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
  });
}

export type CheckoutOutcome =
  { status: "paid"; reference: string } | { status: "dismissed" } | { status: "failed"; message: string };

/**
 * Opens Razorpay's checkout popup (test mode) for a pending booking and confirms the payment on our server.
 * The browser never sets the amount: the server creates the order and the database verifies the signatures.
 */
export function useRazorpayCheckout() {
  const [busy, setBusy] = useState(false);

  const pay = useCallback(
    async (reference: string, prefill?: { name?: string; email?: string }): Promise<CheckoutOutcome> => {
      setBusy(true);
      const finish = <T extends CheckoutOutcome>(outcome: T) => {
        setBusy(false);
        return outcome;
      };

      const started = await startPayment(reference);
      if (!started.ok) return finish({ status: "failed", message: started.message });

      if (!(await loadCheckoutScript()) || !window.Razorpay) {
        return finish({ status: "failed", message: "We could not load the payment window. Check your connection." });
      }
      const Razorpay = window.Razorpay;

      return new Promise<CheckoutOutcome>((resolve) => {
        let lastFailure: string | null = null;
        const checkout = new Razorpay({
          key: started.keyId,
          order_id: started.orderId,
          amount: started.amountPaise,
          currency: "INR",
          name: "TripNest (test mode)",
          description: started.description,
          prefill: { name: prefill?.name ?? "", email: prefill?.email ?? "" },
          theme: { color: "#12284a" },
          handler: async (response: RazorpaySuccess) => {
            const confirmed = await confirmPayment({
              reference: started.reference,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              amountPaise: started.amountPaise,
              binding: started.binding,
            });
            resolve(
              finish(
                confirmed.ok
                  ? { status: "paid", reference: confirmed.reference }
                  : { status: "failed", message: confirmed.message },
              ),
            );
          },
          // The popup lets the guest retry after a failed attempt, so we only finish when they succeed or close it.
          modal: {
            ondismiss: () =>
              resolve(finish(lastFailure ? { status: "failed", message: lastFailure } : { status: "dismissed" })),
          },
        });
        checkout.on("payment.failed", (failure) => {
          lastFailure = failure.error?.description ?? "The payment did not go through. You can try again.";
        });
        checkout.open();
      });
    },
    [],
  );

  return { pay, busy };
}
