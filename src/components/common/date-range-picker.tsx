"use client";

import { useState } from "react";
import { differenceInCalendarDays, format, startOfToday } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type DateRangePickerProps = {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  id?: string;
  placeholder?: string;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

/** Check-in / check-out picker. Past dates are disabled; shows the number of nights once both dates are chosen. */
export function DateRangePicker({
  value,
  onChange,
  id,
  placeholder = "Check-in — Check-out",
  className,
  ...aria
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const nights = value?.from && value?.to ? differenceInCalendarDays(value.to, value.from) : 0;

  const label =
    value?.from && value?.to
      ? `${format(value.from, "d MMM")} — ${format(value.to, "d MMM yyyy")}`
      : value?.from
        ? `${format(value.from, "d MMM yyyy")} — Check-out`
        : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          {...aria}
          className={cn(
            "flex h-11 w-full items-center gap-2.5 rounded-lg border border-input bg-white px-3.5 text-left text-sm transition-colors outline-none hover:border-navy-300 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive",
            !value?.from && "text-muted-foreground",
            className,
          )}
        >
          <CalendarDays className="size-4 shrink-0 text-lagoon-700" aria-hidden="true" />
          <span className="flex-1 truncate">{label}</span>
          {nights > 0 && (
            <span className="shrink-0 text-xs font-medium text-muted-foreground">
              {nights} {nights === 1 ? "night" : "nights"}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {open && (
          <Calendar
            mode="range"
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            disabled={{ before: startOfToday() }}
            defaultMonth={value?.from}
            autoFocus
            className="[&_.rdp-months]:flex-col sm:[&_.rdp-months]:flex-row"
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
