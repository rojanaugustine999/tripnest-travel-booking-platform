import { CreditCard } from "lucide-react";
import type { BookingPayment } from "../queries";

/** Exact amount (with paise), so the receipt matches what Razorpay charged. */
const rupees = (paise: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(paise / 100);

/** A one-line receipt for a test payment. */
export function PaymentSummary({ payment }: { payment: BookingPayment }) {
  return (
    <div className="flex gap-3 rounded-xl bg-white px-4 py-3 text-sm text-slate-800 ring-1 ring-slate-900/5">
      <CreditCard className="mt-0.5 size-4 shrink-0 text-lagoon-700" aria-hidden="true" />
      <div>
        <p className="font-medium">
          {payment.isTest ? "Paid in Razorpay test mode" : "Paid"} · {rupees(payment.amountPaise)}
        </p>
        <p className="text-muted-foreground">
          Payment ID <span className="font-mono">{payment.paymentId}</span> ·{" "}
          {new Date(payment.paidAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          {payment.isTest ? " · No real money was taken." : ""}
        </p>
      </div>
    </div>
  );
}
