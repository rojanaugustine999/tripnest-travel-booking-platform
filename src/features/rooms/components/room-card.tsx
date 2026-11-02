import Image from "next/image";
import { BedDouble, Check, Maximize, Users } from "lucide-react";
import type { HotelOffer, Room } from "@/types/domain";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PriceTag } from "@/features/hotels/components/price-tag";

type RoomCardProps = {
  room: Room;
  offer: HotelOffer | null;
  selected: boolean;
  /** Why the room can't be chosen for the current search, if it can't. */
  unavailableReason?: string;
  onSelect: () => void;
};

/** One room type with its key facts and a select control (a radio in the room list). */
export function RoomCard({ room, offer, selected, unavailableReason, onSelect }: RoomCardProps) {
  const disabled = Boolean(unavailableReason);
  const fewLeft = room.availableUnits > 0 && room.availableUnits <= 3;

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl bg-card ring-1 transition-shadow sm:flex-row",
        selected ? "shadow-card-hover ring-2 ring-lagoon-500" : "shadow-card ring-slate-900/5",
        disabled && "opacity-70",
      )}
    >
      <div className="relative aspect-[16/10] shrink-0 bg-muted sm:aspect-auto sm:w-56">
        <Image
          src={room.imageUrl}
          alt={`${room.name} interior`}
          fill
          sizes="(min-width: 640px) 224px, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5 md:flex-row">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-h4">{room.name}</h3>
            {selected && <Badge variant="soft">Selected</Badge>}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{room.description}</p>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-700">
            <li className="flex items-center gap-1.5">
              <Users className="size-4 text-lagoon-700" aria-hidden="true" />
              Sleeps up to {room.maxGuests}
            </li>
            <li className="flex items-center gap-1.5">
              <BedDouble className="size-4 text-lagoon-700" aria-hidden="true" />
              {room.bedInfo}
            </li>
            <li className="flex items-center gap-1.5">
              <Maximize className="size-4 text-lagoon-700" aria-hidden="true" />
              {room.sizeSqm} m²
            </li>
          </ul>
          <ul
            className="mt-3 grid grid-cols-1 gap-1 text-xs text-slate-600 sm:grid-cols-2"
            aria-label={`${room.name} amenities`}
          >
            {room.amenities.slice(0, 6).map((amenity) => (
              <li key={amenity} className="flex items-center gap-1.5">
                <Check className="size-3.5 text-success" aria-hidden="true" />
                {amenity}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex shrink-0 flex-row items-end justify-between gap-3 border-t border-border pt-4 md:w-44 md:flex-col md:border-t-0 md:border-l md:pt-0 md:pl-5">
          <div className="md:text-right">
            <PriceTag
              price={room.pricePerNight}
              offer={offer}
              align="right"
              className="max-md:items-start max-md:text-left"
            />
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                unavailableReason ? "text-destructive" : fewLeft ? "text-warning" : "text-success",
              )}
            >
              {unavailableReason ?? (fewLeft ? `Only ${room.availableUnits} left` : "Available")}
            </p>
          </div>
          <label
            className={cn(
              "inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
              selected
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-input bg-white text-slate-900 hover:border-navy-300",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            <input
              type="radio"
              name="room"
              value={room.id}
              checked={selected}
              disabled={disabled}
              onChange={onSelect}
              className="sr-only"
            />
            {selected ? <Check className="size-4" aria-hidden="true" /> : null}
            {selected ? "Selected" : "Select room"}
            <span className="sr-only">: {room.name}</span>
          </label>
        </div>
      </div>
    </article>
  );
}
