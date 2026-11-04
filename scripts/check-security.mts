/**
 * Security probe of the live Supabase project, run exactly like an attacker would: signed out, with only the
 * public (publishable) key that every visitor's browser already has.
 *
 *   npm run db:security
 *
 * Reads .env.local, prints no keys, never changes data (write probes use ids that cannot exist and must be
 * refused anyway). Exits with code 1 if any protection is missing.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key?.startsWith("sb_publishable_")) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and a publishable (sb_publishable_…) key in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const NO_ROW = "00000000-0000-4000-8000-000000000000";
let failures = 0;
function report(name: string, passed: boolean, detail = "") {
  if (!passed) failures++;
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}${detail ? `  → ${detail}` : ""}`);
}

console.log(`Probing ${new URL(url).host} as a signed-out visitor…\n`);

// 1. Private tables must refuse reads outright (no table privileges for the anon role).
for (const table of [
  "profiles",
  "bookings",
  "booking_guests",
  "saved_hotels",
  "newsletter_subscribers",
  "contact_messages",
]) {
  const { data, error } = await supabase.from(table).select("*").limit(1);
  report(`cannot read ${table}`, Boolean(error) || (data?.length ?? 0) === 0, error?.message ?? "no rows returned");
}

// 2. Public catalogue tables must refuse every kind of write.
// (An update needs a real column and value: an empty update is a no-op that PostgREST never sends to the database.)
const writeProbes: Record<string, { column: string; value: unknown; filter: string }> = {
  destinations: { column: "name", value: "x", filter: "id" },
  hotels: { column: "name", value: "x", filter: "id" },
  hotel_images: { column: "alt", value: "x", filter: "id" },
  amenities: { column: "name", value: "x", filter: "id" },
  hotel_amenities: { column: "position", value: 1, filter: "hotel_id" },
  rooms: { column: "name", value: "x", filter: "id" },
  reviews: { column: "title", value: "x", filter: "id" },
};
for (const [table, probe] of Object.entries(writeProbes)) {
  const ins = await supabase.from(table).insert({ [probe.column]: probe.value } as never);
  const upd = await supabase
    .from(table)
    .update({ [probe.column]: probe.value } as never)
    .eq(probe.filter, NO_ROW);
  const del = await supabase.from(table).delete().eq(probe.filter, NO_ROW);
  report(
    `cannot insert, update or delete ${table}`,
    Boolean(ins.error) && Boolean(upd.error) && Boolean(del.error),
    [ins.error, upd.error, del.error].map((e) => (e ? "denied" : "ALLOWED")).join("/"),
  );
}

// 3. Anyone can subscribe / send a message, but cannot read them back or spoof a user.
const sub = await supabase.from("newsletter_subscribers").insert({ email: "not-an-email" });
report("newsletter rejects an invalid email", Boolean(sub.error), sub.error?.message);
const spoof = await supabase
  .from("contact_messages")
  .insert({ user_id: NO_ROW, name: "Probe", email: "probe@example.test", subject: "other", message: "Spoof attempt" });
report("contact form cannot attach someone else's user id", Boolean(spoof.error), spoof.error?.message);

// 4. Functions: private ones must be unreachable, public read-only ones must work.
const forbidden: [string, Record<string, unknown>][] = [
  [
    "create_booking",
    {
      p_room_id: NO_ROW,
      p_check_in: "2030-01-01",
      p_check_out: "2030-01-02",
      p_guest_count: 1,
      p_room_count: 1,
      p_guests: [],
      p_special_requests: "",
      p_idempotency_key: NO_ROW,
    },
  ],
  ["cancel_booking", { p_reference: "TN-ZZZZZZZZ" }],
  ["admin_dashboard_stats", {}],
  ["admin_save_hotel", { p_hotel: {} }],
  ["admin_set_booking_status", { p_reference: "TN-ZZZZZZZZ", p_status: "confirmed" }],
  ["admin_set_user_role", { p_user_id: NO_ROW, p_role: "admin" }],
];
for (const [fn, args] of forbidden) {
  const { error } = await supabase.rpc(fn as never, args as never);
  const refused = Boolean(error) && /permission denied|not.*found|could not find/i.test(error?.message ?? "");
  report(`${fn}() is not callable signed out`, refused, error?.message);
}
const search = await supabase.rpc("search_hotels", { p_page_size: 3 });
report(
  "search_hotels() works for visitors (read-only)",
  !search.error && (search.data?.length ?? 0) > 0,
  search.error?.message,
);
const avail = await supabase.rpc("get_room_availability", {
  p_hotel_id: NO_ROW,
  p_check_in: "2030-01-01",
  p_check_out: "2030-01-02",
});
report("get_room_availability() works for visitors (counts only)", !avail.error, avail.error?.message);

// 5. The private schema must not be exposed through the API.
const priv = await fetch(`${url}/rest/v1/`, { headers: { apikey: key, "Accept-Profile": "private" } });
report("the private schema is not exposed", priv.status >= 400, `HTTP ${priv.status}`);

// 6. Only published hotels are visible, and the visible set has no draft/archived hotel.
const { data: hotels } = await supabase.from("hotels").select("is_published, archived_at");
report(
  "visitors only ever see published, non-archived hotels",
  (hotels?.length ?? 0) > 0 && hotels!.every((h) => h.is_published && h.archived_at === null),
  `${hotels?.length ?? 0} hotels visible`,
);

console.log(failures ? `\n${failures} check(s) FAILED.` : "\nAll security probes passed.");
process.exit(failures ? 1 : 0);
