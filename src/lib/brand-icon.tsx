import { ImageResponse } from "next/og";

/** The TripNest mark (navy tile, white roof, coral dot), drawn the same way as the navbar logo. */
export function brandIcon(size: number) {
  return new ImageResponse(
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" fill="#172645" />
      <path
        d="M7 21 16 10l9 11"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22.5" cy="9.5" r="2.7" fill="#f4573a" />
    </svg>,
    { width: size, height: size },
  );
}
