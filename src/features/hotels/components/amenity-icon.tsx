import {
  Bath,
  BedDouble,
  Car,
  Check,
  Coffee,
  Dumbbell,
  PawPrint,
  Plane,
  Snowflake,
  Sparkles,
  Umbrella,
  Users,
  UtensilsCrossed,
  Waves,
  Wifi,
  Wine,
  CookingPot,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  wifi: Wifi,
  pool: Waves,
  breakfast: Coffee,
  parking: Car,
  spa: Sparkles,
  gym: Dumbbell,
  restaurant: UtensilsCrossed,
  bar: Wine,
  "air-conditioning": Snowflake,
  "airport-shuttle": Plane,
  "beach-access": Umbrella,
  "pet-friendly": PawPrint,
  "family-rooms": Users,
  kitchen: CookingPot,
  bath: Bath,
  bed: BedDouble,
};

/** Icon for an amenity slug; falls back to a check mark. */
export function AmenityIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = icons[slug] ?? Check;
  return <Icon className={className} aria-hidden="true" />;
}
