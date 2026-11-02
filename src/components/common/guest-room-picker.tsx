"use client";

import { useState } from "react";
import { Minus, Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type GuestRoomValue = { guests: number; rooms: number };

export const GUEST_LIMITS = { minGuests: 1, maxGuests: 16, minRooms: 1, maxRooms: 8 } as const;

type StepperProps = {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

function Stepper({ label, description, value, min, max, onChange }: StepperProps) {
  const id = `stepper-${label.toLowerCase()}`;
  return (
    <div className="flex items-center justify-between gap-6 py-3" role="group" aria-labelledby={id}>
      <div>
        <p id={id} className="text-sm font-semibold text-slate-900">
          {label}
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          <Minus />
        </Button>
        <span className="w-6 text-center font-semibold tabular-nums" aria-live="polite">
          {value}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          <Plus />
        </Button>
      </div>
    </div>
  );
}

type GuestRoomPickerProps = {
  value: GuestRoomValue;
  onChange: (value: GuestRoomValue) => void;
  id?: string;
  className?: string;
};

/** Guests and rooms selector. Keeps rooms ≤ guests, since every room needs at least one guest. */
export function GuestRoomPicker({ value, onChange, id, className }: GuestRoomPickerProps) {
  const [open, setOpen] = useState(false);
  const { minGuests, maxGuests, minRooms, maxRooms } = GUEST_LIMITS;

  const summary = `${value.guests} ${value.guests === 1 ? "guest" : "guests"} · ${value.rooms} ${value.rooms === 1 ? "room" : "rooms"}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          className={cn(
            "flex h-11 w-full items-center gap-2.5 rounded-lg border border-input bg-white px-3.5 text-left text-sm transition-colors outline-none hover:border-navy-300 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            className,
          )}
        >
          <Users className="size-4 shrink-0 text-lagoon-700" aria-hidden="true" />
          <span className="truncate">{summary}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 divide-y divide-border">
        <Stepper
          label="Guests"
          description="Adults and children"
          value={value.guests}
          min={Math.max(minGuests, value.rooms)}
          max={maxGuests}
          onChange={(guests) => onChange({ ...value, guests })}
        />
        <Stepper
          label="Rooms"
          description="Maximum one room per guest"
          value={value.rooms}
          min={minRooms}
          max={Math.min(maxRooms, value.guests)}
          onChange={(rooms) => onChange({ ...value, rooms })}
        />
        <div className="pt-3">
          <Button className="w-full" size="sm" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
