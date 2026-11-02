import type { Review } from "@/types/domain";
import { hotels } from "./hotels";

// SAMPLE DATA — fictional guest reviews. Each hotel receives three reviews from this pool,
// scored around its average so the numbers stay believable.

const pool: Omit<Review, "id" | "hotelId" | "rating">[] = [
  {
    authorName: "Ananya R.",
    authorCountry: "India",
    title: "Exceeded every expectation",
    comment:
      "From the welcome drink to check-out, the staff remembered our names and made every request feel easy. The room was spotless and the breakfast spread was excellent.",
    stayedOn: "2026-09-14",
  },
  {
    authorName: "James W.",
    authorCountry: "United Kingdom",
    title: "Perfect location",
    comment:
      "Everything we wanted to see was close by, yet the hotel felt calm and quiet at night. Would happily stay again.",
    stayedOn: "2026-08-02",
  },
  {
    authorName: "Meera & Arjun",
    authorCountry: "India",
    title: "Wonderful anniversary stay",
    comment: "The team surprised us with flowers and a cake. The view from our balcony was the highlight of the trip.",
    stayedOn: "2026-10-05",
  },
  {
    authorName: "Sofia L.",
    authorCountry: "Spain",
    title: "Beautiful property, slow restaurant",
    comment:
      "Gorgeous design and very comfortable beds. Service at dinner was a little slow on busy nights, but the food was worth the wait.",
    stayedOn: "2026-07-21",
  },
  {
    authorName: "Rahul K.",
    authorCountry: "India",
    title: "Great for families",
    comment:
      "Our kids loved the pool and the staff were patient and friendly. Rooms were spacious enough for all four of us.",
    stayedOn: "2026-06-11",
  },
  {
    authorName: "Emily C.",
    authorCountry: "Australia",
    title: "Relaxing and well run",
    comment:
      "Check-in was quick, housekeeping was thorough and the spa treatments were superb. A very easy, relaxing stay.",
    stayedOn: "2026-09-28",
  },
  {
    authorName: "Hiroshi T.",
    authorCountry: "Japan",
    title: "Clean and comfortable",
    comment:
      "Very clean, good water pressure and a quiet room. Breakfast had a good mix of local and international options.",
    stayedOn: "2026-05-30",
  },
  {
    authorName: "Priya S.",
    authorCountry: "India",
    title: "Value for money",
    comment:
      "Great price for what you get. The room was smaller than expected, but it was well designed and the location made up for it.",
    stayedOn: "2026-08-19",
  },
  {
    authorName: "Daniel M.",
    authorCountry: "Germany",
    title: "Stunning views",
    comment: "We woke up to an incredible view every morning. Staff arranged excellent day trips for us too.",
    stayedOn: "2026-10-12",
  },
];

function clamp(value: number) {
  return Math.min(10, Math.max(5, Math.round(value * 10) / 10));
}

export const reviews: Review[] = hotels.flatMap((hotel, h) =>
  [0, 1, 2].map((offset) => {
    const base = pool[(h * 2 + offset) % pool.length];
    const variance = [0.4, -0.2, -0.6][offset];
    return {
      id: `${hotel.id}-rev${offset + 1}`,
      hotelId: hotel.id,
      rating: clamp(hotel.reviewScore + variance),
      ...base,
    };
  }),
);
