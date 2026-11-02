"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { differenceInCalendarDays, isValid, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { CalendarCheck, Info } from "lucide-react";
import type { HotelOffer, Room } from "@/types/domain";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DateRangePicker } from "@/components/common/date-range-picker";
import { GuestRoomPicker, type GuestRoomValue } from "@/components/common/guest-room-picker";
import { applyOffer } from "@/features/hotels/lib/pricing";
import { parseHotelSearchParams } from "@/features/hotels/lib/search-params";
import { RoomCard } from "./room-card";

type RoomBookingProps = {
  hotelName: string;
  rooms: Room[];
  offer: HotelOffer | null;
};

function toDate(value?: string) {
  const date = value ? parseISO(value) : undefined;
  return date && isValid(date) ? date : undefined;
}

/**
 * Room comparison and selection with a live price summary.
 * Dates and party size start from the URL (carried over from the search page).
 * The figures here are an estimate; the booking flow (Phase 7) recalculates prices on the server.
 */
export function RoomBooking({ hotelName, rooms, offer }: RoomBookingProps) {
  const initial = parseHotelSearchParams(useSearchParams());
  const [dates, setDates] = useState<DateRange | undefined>(() => {
    const from = toDate(initial.checkIn);
    return from ? { from, to: toDate(initial.checkOut) } : undefined;
  });
  const [party, setParty] = useState<GuestRoomValue>({ guests: initial.guests, rooms: initial.rooms });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const guestsPerRoom = Math.ceil(party.guests / party.rooms);

  function reasonUnavailable(room: Room) {
    if (room.availableUnits === 0) return "Sold out";
    if (room.availableUnits < party.rooms) return `Only ${room.availableUnits} left`;
    if (room.maxGuests < guestsPerRoom) return `Max ${room.maxGuests} guests per room`;
    return undefined;
  }

  const selected = rooms.find((r) => r.id === selectedId) ?? null;
  // If the party changes so the selected room no longer fits, treat it as unselected.
  const selectedRoom = selected && !reasonUnavailable(selected) ? selected : null;
  const nights = dates?.from && dates?.to ? differenceInCalendarDays(dates.to, dates.from) : 0;
  const nightly = selectedRoom ? applyOffer(selectedRoom.pricePerNight, offer) : 0;
  const subtotal = nightly * nights * party.rooms;
  const savings = selectedRoom && offer ? (selectedRoom.pricePerNight - nightly) * nights * party.rooms : 0;

  function reserve() {
    if (!selectedRoom) return setError("Select a room to continue.");
    if (!nights) return setError("Choose your check-in and check-out dates.");
    setError(null);
    toast.info("Demo: no booking was made", {
      description: `The step-by-step booking for ${selectedRoom.name} at ${hotelName} will be available soon.`,
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <fieldset>
        <legend className="sr-only">Choose a room</legend>
        <div className="space-y-5">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              offer={offer}
              selected={selectedRoom?.id === room.id}
              unavailableReason={reasonUnavailable(room)}
              onSelect={() => {
                setSelectedId(room.id);
                setError(null);
              }}
            />
          ))}
        </div>
      </fieldset>

      <aside
        aria-labelledby="stay-summary"
        className="h-fit rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-900/5 lg:sticky lg:top-24"
      >
        <h3 id="stay-summary" className="text-h4">
          Your stay
        </h3>
        <div className="mt-4 space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="stay-dates">Dates</Label>
            <DateRangePicker id="stay-dates" value={dates} onChange={setDates} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="stay-party">Guests & rooms</Label>
            <GuestRoomPicker id="stay-party" value={party} onChange={setParty} />
          </div>
        </div>

        <Separator className="my-5" />

        {selectedRoom ? (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Room</dt>
              <dd className="text-right font-medium text-slate-900">{selectedRoom.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Price per night</dt>
              <dd className="text-slate-900">{formatPrice(nightly)}</dd>
            </div>
            {nights > 0 && (
              <>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">
                    {nights} {nights === 1 ? "night" : "nights"} × {party.rooms} {party.rooms === 1 ? "room" : "rooms"}
                  </dt>
                  <dd className="text-slate-900">{formatPrice(subtotal)}</dd>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between gap-4 text-success">
                    <dt>You save ({offer?.label}, already included)</dt>
                    <dd>{formatPrice(savings)}</dd>
                  </div>
                )}
                <Separator className="my-3" />
                <div className="flex justify-between gap-4 text-base">
                  <dt className="font-semibold text-slate-900">Estimated subtotal</dt>
                  <dd className="font-display font-bold text-slate-900">{formatPrice(subtotal)}</dd>
                </div>
              </>
            )}
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">Select a room to see the price for your stay.</p>
        )}

        <p className="mt-4 flex gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          Taxes and fees are calculated at checkout. Demo booking — no payment is taken.
        </p>

        {error && (
          <p role="alert" className="mt-4 text-sm font-medium text-destructive">
            {error}
          </p>
        )}

        <Button variant="cta" size="lg" className="mt-5 w-full" onClick={reserve}>
          <CalendarCheck />
          Reserve
        </Button>
      </aside>
    </div>
  );
}
