"use client";

import { SlidersHorizontal, X } from "lucide-react";
import type { Amenity } from "@/types/domain";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toggleValue, useHotelSearch } from "../hooks/use-hotel-search";
import { ACCOMMODATION_TYPES, SORT_OPTIONS, countActiveFilters, type SortOption } from "../lib/search-params";
import { HotelFilters } from "./hotel-filters";

/** Sort menu, mobile filter sheet and removable chips for the active filters. */
export function HotelToolbar({ amenities, total }: { amenities: Amenity[]; total: number }) {
  const { params, update } = useHotelSearch();
  const activeCount = countActiveFilters(params);
  const amenityName = new Map(amenities.map((a) => [a.slug, a.name]));

  const chips: { key: string; label: string; remove: () => void }[] = [
    ...(params.destination
      ? [
          {
            key: "destination",
            label: `Destination: ${params.destination.replace(/-/g, " ")}`,
            remove: () => update({ destination: undefined }),
          },
        ]
      : []),
    ...(params.minPrice !== undefined || params.maxPrice !== undefined
      ? [
          {
            key: "price",
            label: `${params.minPrice !== undefined ? formatPrice(params.minPrice) : "₹0"} – ${params.maxPrice !== undefined ? formatPrice(params.maxPrice) : "any"}`,
            remove: () => update({ minPrice: undefined, maxPrice: undefined }),
          },
        ]
      : []),
    ...params.stars.map((s) => ({
      key: `stars-${s}`,
      label: `${s} stars`,
      remove: () => update({ stars: toggleValue(params.stars, s) }),
    })),
    ...(params.rating
      ? [{ key: "rating", label: `Rating ${params.rating}+`, remove: () => update({ rating: undefined }) }]
      : []),
    ...params.types.map((t) => ({
      key: `type-${t}`,
      label: ACCOMMODATION_TYPES.find((a) => a.value === t)?.label ?? t,
      remove: () => update({ types: toggleValue(params.types, t) }),
    })),
    ...params.amenities.map((a) => ({
      key: `amenity-${a}`,
      label: amenityName.get(a) ?? a,
      remove: () => update({ amenities: toggleValue(params.amenities, a) }),
    })),
    ...(params.available
      ? [{ key: "available", label: "Available only", remove: () => update({ available: false }) }]
      : []),
  ];

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600" aria-live="polite">
          <span className="font-semibold text-slate-900">{total}</span> {total === 1 ? "property" : "properties"} found
        </p>

        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <SlidersHorizontal />
                Filters{activeCount > 0 && ` (${activeCount})`}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[90%] max-w-sm overflow-y-auto p-6">
              <SheetHeader className="sr-only p-0">
                <SheetTitle>Filter hotels</SheetTitle>
                <SheetDescription>Results update as you change filters.</SheetDescription>
              </SheetHeader>
              <HotelFilters amenities={amenities} />
            </SheetContent>
          </Sheet>

          <Label htmlFor="sort" className="sr-only">
            Sort by
          </Label>
          <Select value={params.sort} onValueChange={(value) => update({ sort: value as SortOption })}>
            <SelectTrigger id="sort" size="sm" className="min-w-48">
              <span className="text-muted-foreground">Sort:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {chips.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Active filters">
          {chips.map((chip) => (
            <li key={chip.key}>
              <button
                type="button"
                onClick={chip.remove}
                className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 py-1.5 pr-2.5 pl-3 text-xs font-medium text-navy-900 transition-colors hover:bg-navy-100"
                aria-label={`Remove filter: ${chip.label}`}
              >
                {chip.label}
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
