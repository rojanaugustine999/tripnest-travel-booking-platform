/**
 * Verifies the live Supabase project the way the browser sees it (publishable key, signed out).
 *
 *   npm run db:check
 *
 * Reads .env.local. Prints no keys. Exits with code 1 if any check fails.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local");
  process.exit(1);
}
if (!key.startsWith("sb_publishable_")) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not a publishable key (expected sb_publishable_…). Do not use the secret key here.",
  );
  process.exit(1);
}

const supabase = createClient<Database>(url, key, { auth: { persistSession: false } });
let failures = 0;

function report(name: string, passed: boolean, detail = "") {
  if (!passed) failures++;
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}${detail ? `  → ${detail}` : ""}`);
}

async function count(table: keyof Database["public"]["Tables"]) {
  const { count: n, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  return { n: n ?? 0, error: error?.message };
}

console.log(`Checking ${new URL(url).host} as a signed-out visitor…\n`);

for (const [table, expected] of [
  ["destinations", 12],
  ["hotels", 17],
  ["rooms", 47],
  ["amenities", 14],
  ["reviews", 51],
] as const) {
  const { n, error } = await count(table);
  report(`can read ${table} (${expected} sample rows)`, !error && n === expected, error ?? `${n} rows`);
}

const { data: hotel, error: joinError } = await supabase
  .from("hotels")
  .select("name, destinations(name), rooms(name, price_per_night), hotel_images(url)")
  .eq("slug", "palm-shore-beach-resort")
  .single();
report(
  "related data loads in one request (hotel + destination + rooms + images)",
  !joinError && (hotel?.rooms?.length ?? 0) === 3,
  joinError?.message ?? hotel?.name,
);

const profiles = await supabase.from("profiles").select("id").limit(1);
report(
  "profiles are NOT readable when signed out",
  Boolean(profiles.error) || (profiles.data?.length ?? 0) === 0,
  profiles.error?.message ?? "0 rows",
);

const bookings = await supabase.from("bookings").select("id").limit(1);
report(
  "bookings are NOT readable when signed out",
  Boolean(bookings.error) || (bookings.data?.length ?? 0) === 0,
  bookings.error?.message ?? "0 rows",
);

const tamper = await supabase
  .from("hotels")
  .update({ name: "Hacked" })
  .eq("slug", "palm-shore-beach-resort")
  .select("id");
report(
  "hotels cannot be modified when signed out",
  Boolean(tamper.error) || (tamper.data?.length ?? 0) === 0,
  tamper.error?.message ?? "0 rows changed",
);

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll checks passed — Supabase is connected and secured.");
process.exit(failures ? 1 : 0);
