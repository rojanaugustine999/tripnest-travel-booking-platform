"use client";

import { useRouter } from "next/navigation";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRazorpayCheckout } from "./use-razorpay-checkout";

/** "Pay now" for a pending booking (Razorpay test mode). Refreshes the page when the payment is confirmed. */
export function PayNowButton({
  reference,
  prefill,
  size = "lg",
}: {
  reference: string;
  prefill?: { name?: string; email?: string };
  size?: "default" | "lg";
}) {
  const router = useRouter();
  const { pay, busy } = useRazorpayCheckout();

  async function onClick() {
    const outcome = await pay(reference, prefill);
    if (outcome.status === "paid") {
      toast.success("Payment received (test mode). Your booking is confirmed.");
      router.push(`/confirmation/${outcome.reference}`);
      router.refresh();
    } else if (outcome.status === "failed") {
      toast.error(outcome.message);
      router.refresh();
    }
  }

  return (
    <Button type="button" variant="cta" size={size} onClick={onClick} disabled={busy}>
      {busy ? <Loader2 className="animate-spin" /> : <CreditCard />}
      {busy ? "Opening payment…" : "Pay now (test mode)"}
    </Button>
  );
}
