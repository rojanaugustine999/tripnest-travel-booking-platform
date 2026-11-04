import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/*
 * Runs before every matching request (Next.js 16 "Proxy", formerly middleware):
 *   1. Refreshes the Supabase session so users stay signed in (Server Components can't write cookies).
 *   2. Sends signed-out visitors away from account pages, and signed-in users away from login/register.
 *
 * This is a convenience layer. The real protection is server-side: every protected page and action
 * calls requireUser()/requireAdmin(), and Row Level Security guards the data itself.
 */

const PROTECTED_PREFIXES = ["/dashboard", "/bookings", "/saved-hotels", "/profile", "/admin"];
const GUEST_ONLY_PATHS = ["/login", "/register", "/forgot-password"];

const startsWithAny = (path: string, prefixes: string[]) =>
  prefixes.some((p) => path === p || path.startsWith(`${p}/`));

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // Pass refreshed tokens to Server Components (request) and to the browser (response).
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          // Cache headers stop a CDN from caching one user's session cookie and serving it to others.
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // Do not add code between createServerClient and getClaims — it can cause random sign-outs.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims?.sub);
  const { pathname, search } = request.nextUrl;

  let redirectTo: URL | null = null;
  if (!isSignedIn && startsWithAny(pathname, PROTECTED_PREFIXES)) {
    redirectTo = new URL("/login", request.url);
    redirectTo.searchParams.set("next", `${pathname}${search}`);
  } else if (isSignedIn && startsWithAny(pathname, GUEST_ONLY_PATHS)) {
    redirectTo = new URL("/dashboard", request.url);
  }

  if (!redirectTo) return response;

  // A redirect must carry the refreshed cookies and cache headers too, or the user is signed out.
  const redirect = NextResponse.redirect(redirectTo);
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = response.headers.get(header);
    if (value) redirect.headers.set(header, value);
  }
  return redirect;
}

export const config = {
  matcher: [
    // Everything except Next.js internals, images and other static files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
