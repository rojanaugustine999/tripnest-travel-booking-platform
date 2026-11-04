"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { ArrowLeft, CalendarDays, Info, Loader2, Lock, ShieldCheck, Users } from "lucide-react";
import type { HotelOffer } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/common/form-field";
import { FormMessage } from "@/features/auth/components/form-message";
import { createBooking } from "../actions";
import { calculateStay } from "../lib/pricing";
import { bookingFormSchema, type BookingFormInput } from "../validation";
import { PriceBreakdown } from "./price-breakdown";

export type BookingFlowProps = {
  hotel: { name: string; city: string; country: string; imageUrl: string; imageAlt: string };
  room: { id: string; name: string; bedInfo: string; pricePerNight: number };
  offer: HotelOffer | null;
  stay: { checkIn: string; checkOut: string; nights: number; guests: number; rooms: number };
  prefill: { fullName: string; email: string };
};

const longDate = (iso: string) => format(parseISO(iso), "EEE d MMM yyyy");

/**
 * Two steps: (1) guest details, (2) review and confirm. The price shown here is an estimate;
 * the database works out the real price when the booking is created.
 */
export function BookingFlow({ hotel, room, offer, stay, prefill }: BookingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "review">("details");
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  // One key per visit to this page: if the same submission is sent twice, only one booking is created.
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const {
    register,
    control,
    handleSubmit,
    trigger,
    getValues,
    setError,
    formState: { errors },
  } = useForm<BookingFormInput>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      fullName: prefill.fullName,
      email: prefill.email,
      phone: "",
      additionalGuests: Array.from({ length: Math.max(0, stay.guests - 1) }, () => ({ fullName: "" })),
      specialRequests: "",
      acceptDemo: false,
    },
  });
  const { fields } = useFieldArray({ control, name: "additionalGuests" });

  const price = calculateStay({ pricePerNight: room.pricePerNight, offer, nights: stay.nights, rooms: stay.rooms });

  async function goToReview() {
    const valid = await trigger(["fullName", "email", "phone", "additionalGuests", "specialRequests"]);
    if (valid) {
      setServerError(null);
      setStep("review");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function submit(values: BookingFormInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await createBooking({
        roomId: room.id,
        checkIn: stay.checkIn,
        checkOut: stay.checkOut,
        guests: stay.guests,
        rooms: stay.rooms,
        idempotencyKey,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        additionalGuests: values.additionalGuests,
        specialRequests: values.specialRequests,
      });
      if (result.ok) {
        router.push(`/confirmation/${result.reference}`);
        return;
      }
      if (result.signedOut) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
        setError(field as keyof BookingFormInput, { type: "server", message });
      }
      setServerError(result.message);
      if (result.fieldErrors) setStep("details");
    });
  }

  const values = step === "review" ? getValues() : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div>
        <ol className="mb-6 flex items-center gap-3 text-sm font-medium" aria-label="Booking steps">
          <li
            className={step === "details" ? "text-navy-900" : "text-muted-foreground"}
            aria-current={step === "details" ? "step" : undefined}
          >
            1. Guest details
          </li>
          <li aria-hidden="true" className="text-muted-foreground">
            —
          </li>
          <li
            className={step === "review" ? "text-navy-900" : "text-muted-foreground"}
            aria-current={step === "review" ? "step" : undefined}
          >
            2. Review &amp; confirm
          </li>
        </ol>

        <div className="mb-6 flex gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            <strong>Demo booking — no payment is taken</strong> and no real hotel is contacted. Please don&apos;t enter
            card details anywhere.
          </p>
        </div>

        {serverError && (
          <div className="mb-6">
            <FormMessage tone="error">{serverError}</FormMessage>
          </div>
        )}

        <form onSubmit={handleSubmit(submit)} noValidate>
          {/* Step 1 stays mounted (just hidden) so typed values are kept when going back and forth. */}
          <div hidden={step !== "details"} className="space-y-5">
            <h2 className="text-h3">Who is staying?</h2>
            <FormField id="guest-name" label="Main guest's full name" required error={errors.fullName?.message}>
              {(field) => <Input {...field} autoComplete="name" {...register("fullName")} />}
            </FormField>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="guest-email"
                label="Email"
                required
                hint="We show your booking here, no email is sent."
                error={errors.email?.message}
              >
                {(field) => <Input {...field} type="email" autoComplete="email" {...register("email")} />}
              </FormField>
              <FormField id="guest-phone" label="Phone (optional)" error={errors.phone?.message}>
                {(field) => <Input {...field} type="tel" autoComplete="tel" {...register("phone")} />}
              </FormField>
            </div>

            {fields.length > 0 && (
              <fieldset className="space-y-4 rounded-xl border border-border p-4">
                <legend className="px-1 text-sm font-medium text-slate-800">Other guests (optional)</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  {fields.map((item, index) => (
                    <FormField
                      key={item.id}
                      id={`guest-extra-${index}`}
                      label={`Guest ${index + 2} full name`}
                      error={errors.additionalGuests?.[index]?.fullName?.message}
                    >
                      {(field) => <Input {...field} {...register(`additionalGuests.${index}.fullName` as const)} />}
                    </FormField>
                  ))}
                </div>
              </fieldset>
            )}

            <FormField
              id="guest-requests"
              label="Special requests (optional)"
              hint="Requests are not guaranteed in this demo."
              error={errors.specialRequests?.message}
            >
              {(field) => <Textarea {...field} rows={3} maxLength={1000} {...register("specialRequests")} />}
            </FormField>

            <Button type="button" variant="cta" size="lg" onClick={goToReview}>
              Continue to review
            </Button>
          </div>

          {step === "review" && values && (
            <div className="space-y-6">
              <h2 className="text-h3">Review your booking</h2>
              <dl className="grid gap-4 rounded-2xl border border-border p-5 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Main guest</dt>
                  <dd className="font-medium text-slate-900">{values.fullName}</dd>
                  <dd className="text-slate-600">{values.email}</dd>
                  {values.phone && <dd className="text-slate-600">{values.phone}</dd>}
                </div>
                <div>
                  <dt className="text-muted-foreground">Other guests</dt>
                  <dd className="text-slate-900">
                    {values.additionalGuests
                      .filter((g) => g.fullName)
                      .map((g) => g.fullName)
                      .join(", ") || "None added"}
                  </dd>
                </div>
                {values.specialRequests && (
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground">Special requests</dt>
                    <dd className="text-slate-900">{values.specialRequests}</dd>
                  </div>
                )}
              </dl>

              <div className="space-y-1.5">
                <label className="flex items-start gap-3 text-sm text-slate-800">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 rounded border-border accent-navy-900"
                    aria-invalid={Boolean(errors.acceptDemo)}
                    {...register("acceptDemo")}
                  />
                  <span>I understand this is a demo booking: no payment is taken and no real reservation is made.</span>
                </label>
                {errors.acceptDemo && (
                  <p role="alert" className="text-sm font-medium text-destructive">
                    {errors.acceptDemo.message}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="outline" size="lg" onClick={() => setStep("details")} disabled={pending}>
                  <ArrowLeft />
                  Edit details
                </Button>
                <Button type="submit" variant="cta" size="lg" disabled={pending}>
                  {pending ? <Loader2 className="animate-spin" /> : <Lock />}
                  {pending ? "Confirming…" : "Confirm demo booking"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>

      <aside
        aria-label="Booking summary"
        className="h-fit rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-900/5 lg:sticky lg:top-24"
      >
        <div className="flex gap-4">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
            <Image src={hotel.imageUrl} alt={hotel.imageAlt} fill sizes="80px" className="object-cover" />
          </div>
          <div>
            <h3 className="font-display text-base leading-snug font-bold text-slate-900">{hotel.name}</h3>
            <p className="text-sm text-muted-foreground">
              {hotel.city}, {hotel.country}
            </p>
            {offer && (
              <Badge variant="offer" className="mt-1.5">
                {offer.discountPercent}% off
              </Badge>
            )}
          </div>
        </div>
        <ul className="mt-5 space-y-2 text-sm text-slate-700">
          <li className="flex gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-lagoon-700" aria-hidden="true" />
            {room.name} · {room.bedInfo}
          </li>
          <li className="flex gap-2">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-lagoon-700" aria-hidden="true" />
            {longDate(stay.checkIn)} → {longDate(stay.checkOut)}
          </li>
          <li className="flex gap-2">
            <Users className="mt-0.5 size-4 shrink-0 text-lagoon-700" aria-hidden="true" />
            {stay.guests} {stay.guests === 1 ? "guest" : "guests"} · {stay.rooms} {stay.rooms === 1 ? "room" : "rooms"}
          </li>
        </ul>
        <div className="mt-5 border-t border-border pt-5">
          <PriceBreakdown price={price} savingLabel={offer?.label} />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Final price is confirmed by our server when you book. Demo — no payment taken.
        </p>
      </aside>
    </div>
  );
}
