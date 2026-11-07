import { photos } from "@/features/hotels/data/photos";
import { unsplash } from "@/lib/utils/images";

/** Background photos for the home page hero. The label is read aloud by screen readers and shown in the controls. */
export const heroSlides = [
  { src: unsplash("1540541338287-41700207dee6", 2000), label: "Clifftop resort pool above the sea" },
  { src: photos.maldivesVillas, label: "Overwater villas in the Maldives" },
  { src: unsplash("1507525428034-b723cf961d3e", 2000), label: "Tropical beach at sunrise" },
  { src: photos.tropicalResortMountains, label: "Resort pool below the mountains" },
  { src: photos.singaporeBay, label: "Singapore bay skyline" },
] as const;
