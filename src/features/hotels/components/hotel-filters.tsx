"use client";

import { useState, type FormEvent } from "react";
import type { Amenity } from "@/types/domain";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RatingStars } from "@/components/common/rating-stars";
import { toggleValue, useHotelSearch } from "../hooks/use-hotel-search";
import { ACCOMMODATION_TYPES, GUEST_RATING_OPTIONS, countActiveFilters } from "../lib/search-params";

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-border py-5 first:border-t-0 first:pt-0">
      <legend className="mb-3 font-display text-sm font-semibold text-slate-900">{title}</legend>
      {children}
    </fieldset>
  );
}

function CheckboxRow({
  id,
  checked,
  onChange,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="flex-1 cursor-pointer font-normal text-slate-700">
        {children}
      </Label>
    </div>
  );
}

function PriceFilter({
  min,
  max,
  onApply,
}: {
  min?: number;
  max?: number;
  onApply: (min?: number, max?: number) => void;
}) {
  // `key` on the parent resets these fields whenever the URL values change.
  const [minValue, setMinValue] = useState(min?.toString() ?? "");
  const [maxValue, setMaxValue] = useState(max?.toString() ?? "");

  function submit(event: FormEvent) {
    event.preventDefault();
    const toNumber = (v: string) =>
      v.trim() === "" || Number.isNaN(Number(v)) ? undefined : Math.max(0, Math.round(Number(v)));
    onApply(toNumber(minValue), toNumber(maxValue));
  }

  return (
    <form onSubmit={submit} className="space-y-3" aria-label="Price per night">
      <div className="grid grid-cols-2 gap-2">
        <div className="grid gap-1">
          <Label htmlFor="price-min" className="text-xs text-muted-foreground">
            Min (₹)
          </Label>
          <Input
            id="price-min"
            inputMode="numeric"
            type="number"
            min={0}
            step={500}
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
            placeholder="0"
            className="h-10"
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="price-max" className="text-xs text-muted-foreground">
            Max (₹)
          </Label>
          <Input
            id="price-max"
            inputMode="numeric"
            type="number"
            min={0}
            step={500}
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value)}
            placeholder="Any"
            className="h-10"
          />
        </div>
      </div>
      <Button type="submit" variant="outline" size="sm" className="w-full">
        Apply price
      </Button>
    </form>
  );
}

type HotelFiltersProps = {
  amenities: Amenity[];
  className?: string;
};

/** All hotel filters. Each change updates the URL, which re-renders the server-side results. */
export function HotelFilters({ amenities, className }: HotelFiltersProps) {
  const { params, update, isPending } = useHotelSearch();
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const visibleAmenities = showAllAmenities ? amenities : amenities.slice(0, 7);
  const activeCount = countActiveFilters(params);

  return (
    <div className={cn("transition-opacity", isPending && "opacity-60", className)} aria-busy={isPending}>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-h4">Filters</h2>
        {activeCount > 0 && (
          <Button
            variant="link"
            size="sm"
            className="h-auto"
            onClick={() =>
              update({
                minPrice: undefined,
                maxPrice: undefined,
                stars: [],
                rating: undefined,
                amenities: [],
                types: [],
                available: false,
              })
            }
          >
            Clear all ({activeCount})
          </Button>
        )}
      </div>

      <FilterGroup title="Price per night">
        <PriceFilter
          key={`${params.minPrice ?? ""}-${params.maxPrice ?? ""}`}
          min={params.minPrice}
          max={params.maxPrice}
          onApply={(minPrice, maxPrice) => update({ minPrice, maxPrice })}
        />
      </FilterGroup>

      <FilterGroup title="Star rating">
        <div className="space-y-2.5">
          {[5, 4, 3].map((stars) => (
            <CheckboxRow
              key={stars}
              id={`stars-${stars}`}
              checked={params.stars.includes(stars)}
              onChange={() => update({ stars: toggleValue(params.stars, stars) })}
            >
              <span className="sr-only">{stars} stars</span>
              <RatingStars rating={stars} />
            </CheckboxRow>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Guest rating">
        <RadioGroup
          value={params.rating ? String(params.rating) : "any"}
          onValueChange={(value) => update({ rating: value === "any" ? undefined : Number(value) })}
          className="gap-2.5"
        >
          {[
            { value: "any", label: "Any rating" },
            ...GUEST_RATING_OPTIONS.map((o) => ({ value: String(o.value), label: o.label })),
          ].map((option) => (
            <div key={option.value} className="flex items-center gap-2.5">
              <RadioGroupItem value={option.value} id={`rating-${option.value}`} />
              <Label htmlFor={`rating-${option.value}`} className="cursor-pointer font-normal text-slate-700">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </FilterGroup>

      <FilterGroup title="Accommodation type">
        <div className="space-y-2.5">
          {ACCOMMODATION_TYPES.map((type) => (
            <CheckboxRow
              key={type.value}
              id={`type-${type.value}`}
              checked={params.types.includes(type.value)}
              onChange={() => update({ types: toggleValue(params.types, type.value) })}
            >
              {type.label}
            </CheckboxRow>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Amenities">
        <div className="space-y-2.5">
          {visibleAmenities.map((amenity) => (
            <CheckboxRow
              key={amenity.id}
              id={`amenity-${amenity.slug}`}
              checked={params.amenities.includes(amenity.slug)}
              onChange={() => update({ amenities: toggleValue(params.amenities, amenity.slug) })}
            >
              {amenity.name}
            </CheckboxRow>
          ))}
        </div>
        {amenities.length > 7 && (
          <Button
            variant="link"
            size="sm"
            className="mt-3 h-auto"
            onClick={() => setShowAllAmenities((v) => !v)}
            aria-expanded={showAllAmenities}
          >
            {showAllAmenities ? "Show fewer" : `Show all ${amenities.length}`}
          </Button>
        )}
      </FilterGroup>

      <FilterGroup title="Availability">
        <CheckboxRow
          id="available-only"
          checked={params.available}
          onChange={() => update({ available: !params.available })}
        >
          Only show hotels with rooms available
        </CheckboxRow>
      </FilterGroup>
    </div>
  );
}
