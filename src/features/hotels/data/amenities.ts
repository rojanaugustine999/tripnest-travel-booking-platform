import type { Amenity } from "@/types/domain";

// SAMPLE DATA — mirrors the future `amenities` table.
export const amenities: Amenity[] = [
  { id: "amn-wifi", slug: "wifi", name: "Free Wi-Fi" },
  { id: "amn-pool", slug: "pool", name: "Swimming pool" },
  { id: "amn-breakfast", slug: "breakfast", name: "Breakfast included" },
  { id: "amn-parking", slug: "parking", name: "Free parking" },
  { id: "amn-spa", slug: "spa", name: "Spa" },
  { id: "amn-gym", slug: "gym", name: "Fitness centre" },
  { id: "amn-restaurant", slug: "restaurant", name: "Restaurant" },
  { id: "amn-bar", slug: "bar", name: "Bar" },
  { id: "amn-ac", slug: "air-conditioning", name: "Air conditioning" },
  { id: "amn-shuttle", slug: "airport-shuttle", name: "Airport shuttle" },
  { id: "amn-beach", slug: "beach-access", name: "Beach access" },
  { id: "amn-pets", slug: "pet-friendly", name: "Pet friendly" },
  { id: "amn-family", slug: "family-rooms", name: "Family rooms" },
  { id: "amn-kitchen", slug: "kitchen", name: "Kitchen" },
];
