"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, isValid, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";
import { MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DateRangePicker } from "@/components/common/date-range-picker";
import { GuestRoomPicker, type GuestRoomValue } from "@/components/common/guest-room-picker";
import { parseHotelSearchParams, toHotelSearchQuery } from "../lib/search-params";

type HotelSearchFormProps = {
  suggestions: string[];
  /** "hero" = large card on the homepage; "bar" = compact bar above search results. */
  variant?: "hero" | "bar";
  className?: string;
};

function toDate(value?: string) {
  if (!value) return undefined;
  const date = parseISO(value);
  return isValid(date) ? date : undefined;
}

/**
 * Destination, dates, guests and rooms. Submitting navigates to /hotels with the choices in the URL.
 * On the results page it keeps the current filters and sort, and resets pagination.
 */
export function HotelSearchForm({ suggestions, variant = "hero", className }: HotelSearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = parseHotelSearchParams(searchParams);
  const uid = useId();

  const [query, setQuery] = useState(current.q ?? "");
  const [dates, setDates] = useState<DateRange | undefined>(() => {
    const from = toDate(current.checkIn);
    return from ? { from, to: toDate(current.checkOut) } : undefined;
  });
  const [party, setParty] = useState<GuestRoomValue>({ guests: current.guests, rooms: current.rooms });
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (dates?.from && !dates.to) {
      setError("Please choose a check-out date.");
      return;
    }
    setError(null);

    const base = variant === "bar" ? current : parseHotelSearchParams({});
    const qs = toHotelSearchQuery({
      ...base,
      q: query.trim() || undefined,
      // A free-text search replaces a destination chosen from a destination page.
      destination: query.trim() ? undefined : base.destination,
      checkIn: dates?.from ? format(dates.from, "yyyy-MM-dd") : undefined,
      checkOut: dates?.to ? format(dates.to, "yyyy-MM-dd") : undefined,
      guests: party.guests,
      rooms: party.rooms,
      page: 1,
    });
    router.push(`/hotels${qs}`);
  }

  const isHero = variant === "hero";
  const labelClass = cn("text-xs font-semibold tracking-wide text-slate-600 uppercase", !isHero && "sr-only");

  return (
    <form
      role="search"
      aria-label="Search hotels"
      onSubmit={handleSubmit}
      className={cn(
        "grid gap-3 rounded-2xl bg-white",
        isHero
          ? "p-4 shadow-card-hover sm:p-5 lg:grid-cols-[1.4fr_1.3fr_1fr_auto] lg:items-end"
          : "p-3 shadow-card ring-1 ring-slate-900/5 md:grid-cols-[1.4fr_1.3fr_1fr_auto]",
        className,
      )}
      noValidate
    >
      <div className="grid gap-1.5">
        <Label htmlFor={`${uid}-q`} className={labelClass}>
          Destination
        </Label>
        <div className="relative">
          <MapPin
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-lagoon-700"
            aria-hidden="true"
          />
          <input
            id={`${uid}-q`}
            name="q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            list={`${uid}-suggestions`}
            placeholder="Where are you going?"
            autoComplete="off"
            className="h-11 w-full rounded-lg border border-input bg-white pr-3.5 pl-10 text-sm outline-none placeholder:text-muted-foreground hover:border-navy-300 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <datalist id={`${uid}-suggestions`}>
            {suggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor={`${uid}-dates`} className={labelClass}>
          Check-in — Check-out
        </Label>
        <DateRangePicker
          id={`${uid}-dates`}
          value={dates}
          onChange={(range) => {
            setDates(range);
            setError(null);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${uid}-error` : undefined}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor={`${uid}-party`} className={labelClass}>
          Guests & rooms
        </Label>
        <GuestRoomPicker id={`${uid}-party`} value={party} onChange={setParty} />
      </div>

      <Button
        type="submit"
        variant="cta"
        size={isHero ? "lg" : "default"}
        className={cn("w-full", isHero && "lg:w-auto")}
      >
        <Search />
        Search
      </Button>

      {error && (
        <p id={`${uid}-error`} role="alert" className="text-sm font-medium text-destructive lg:col-span-4">
          {error}
        </p>
      )}
    </form>
  );
}
