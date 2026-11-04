import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/validations/auth";

/*
 * Landing point for links in Supabase emails (confirm sign-up, reset password).
 *
 * Handles both link formats:
 *  - ?code=…                  Supabase's default email templates (PKCE). Must be opened in the same
 *                             browser that started the flow; the code is valid for 5 minutes, once.
 *  - ?token_hash=…&type=…     Custom templates (possible later with our own SMTP provider).
 *
 * On success the session cookie is set and the user goes to `next` (internal paths only).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"));

  const supabase = await createClient();
  let ok = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ok = !error;
  }

  const destination = request.nextUrl.clone();
  destination.search = "";
  if (ok) {
    const target = new URL(next, request.url);
    destination.pathname = target.pathname;
    destination.search = target.search;
    if (next === "/dashboard") destination.searchParams.set("notice", "email-confirmed");
  } else {
    destination.pathname = "/login";
    destination.searchParams.set("error", "link-invalid");
  }
  return NextResponse.redirect(destination);
}
