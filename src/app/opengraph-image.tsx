import { ImageResponse } from "next/og";

/*
 * The picture shown when a TripNest link is shared (LinkedIn, WhatsApp, Slack, X...).
 * Generated once at build time: no external fonts or photos are fetched.
 */
export const alt = "TripNest — a hotel booking portfolio project";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        color: "white",
        background: "linear-gradient(135deg, #0b1630 0%, #172645 55%, #0f6a68 100%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
            color: "#172645",
            fontWeight: 800,
          }}
        >
          ^
        </div>
        <div style={{ fontSize: 44, fontWeight: 800, display: "flex" }}>
          <span>Trip</span>
          <span style={{ color: "#5eead4" }}>Nest</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, display: "flex" }}>Find your perfect stay</div>
        <div style={{ fontSize: 32, color: "#cbd5e1", display: "flex" }}>
          Search hotels, book a room and pay in Razorpay test mode. Full-stack portfolio project.
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, fontSize: 24, color: "#e2e8f0" }}>
        {["Next.js 16", "Supabase", "TypeScript", "Tailwind CSS"].map((tag) => (
          <div
            key={tag}
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: 999,
              border: "2px solid rgba(255,255,255,0.35)",
            }}
          >
            {tag}
          </div>
        ))}
      </div>
    </div>,
    { ...size },
  );
}
