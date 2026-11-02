"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { Heart, Info, Menu, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DateRangePicker } from "@/components/common/date-range-picker";
import { FormField } from "@/components/common/form-field";

export function FormDemo() {
  const [dates, setDates] = useState<DateRange | undefined>();
  const [email, setEmail] = useState("not-an-email");
  const emailError = /^\S+@\S+\.\S+$/.test(email) ? undefined : "Enter a valid email address.";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <FormField id="ds-name" label="Full name" hint="As shown on your ID." required>
        {(field) => <Input {...field} placeholder="Priya Sharma" autoComplete="name" />}
      </FormField>

      <FormField id="ds-email" label="Email" error={emailError} required>
        {(field) => (
          <Input
            {...field}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        )}
      </FormField>

      <FormField id="ds-dates" label="Check-in and check-out">
        {(field) => <DateRangePicker {...field} value={dates} onChange={setDates} />}
      </FormField>

      <FormField id="ds-type" label="Accommodation type">
        {(field) => (
          <Select>
            <SelectTrigger {...field} className="w-full">
              <SelectValue placeholder="Any type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hotel">Hotel</SelectItem>
              <SelectItem value="resort">Resort</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
            </SelectContent>
          </Select>
        )}
      </FormField>

      <FormField
        id="ds-requests"
        label="Special requests"
        hint="Optional — e.g. late check-in."
        className="md:col-span-2"
      >
        {(field) => <Textarea {...field} placeholder="Let the hotel know…" />}
      </FormField>

      <fieldset className="md:col-span-2">
        <legend className="mb-3 text-sm font-medium text-slate-800">Amenities</legend>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {["Free Wi-Fi", "Swimming pool", "Breakfast included", "Free parking"].map((amenity, i) => (
            <div key={amenity} className="flex items-center gap-2">
              <Checkbox id={`ds-amenity-${i}`} defaultChecked={i === 0} />
              <Label htmlFor={`ds-amenity-${i}`} className="font-normal">
                {amenity}
              </Label>
            </div>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center gap-2">
        <Checkbox id="ds-disabled" disabled />
        <Label htmlFor="ds-disabled" className="font-normal">
          Disabled option
        </Label>
      </div>
      <Input placeholder="Disabled input" disabled aria-label="Disabled input" />
    </div>
  );
}

export function OverlayDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Trash2 />
            Open dialog
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove saved hotel?</DialogTitle>
            <DialogDescription>The Lagoon Bay Resort will be removed from your saved hotels.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={() => toast.success("Hotel removed from saved list")}>Remove</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Settings />
            Dropdown menu
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Recommended</DropdownMenuItem>
          <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
          <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
          <DropdownMenuItem>Highest rated</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">
            <Menu />
            Open sheet
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>On mobile, hotel filters open in a sheet like this.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Taxes information">
            <Info />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Taxes are calculated at checkout</TooltipContent>
      </Tooltip>

      <Button
        variant="secondary"
        onClick={() => toast.success("Hotel saved", { description: "Find it in Saved hotels." })}
      >
        <Heart />
        Show toast
      </Button>
      <Button variant="ghost" onClick={() => toast.error("Something went wrong. Please try again.")}>
        Error toast
      </Button>
    </div>
  );
}
