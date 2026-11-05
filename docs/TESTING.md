# TripNest — testing and security report (Phase 10)

Date: 4 November 2026 · Tested against the live `tripnest` Supabase project and a production build (`npm run build` + `npm run start`).

## How to repeat the checks

| Command               | What it proves                                                                               |
| --------------------- | -------------------------------------------------------------------------------------------- |
| `npm run typecheck`   | TypeScript is happy (strict mode)                                                            |
| `npm run lint`        | ESLint has no errors or warnings                                                             |
| `npm run build`       | Production build succeeds (60 pages)                                                         |
| `npm run test:logic`  | 55 checks of validators, price maths and the redirect guard with attacker-style input        |
| `npm run db:check`    | Public data is readable and private data is not, as a signed-out visitor                     |
| `npm run db:security` | 25 live probes of the real database as an attacker: reads, writes, functions, private schema |

The database policy suite (RLS, booking, cancel and admin functions: 129 passing checks) runs on a local Postgres engine (PGlite) and lives outside the repository; its results are summarised below. One check in it fails on purpose-known grounds (see "Known findings").

## Results

### Security

| Area                          | Result  | Notes                                                                                                                                                                                                             |
| ----------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Secrets in code and history   | Pass    | Only `.env.example` (placeholders) is tracked; `.env.local` is ignored; no keys in git history; no `dangerouslySetInnerHTML`/`eval`                                                                               |
| Secrets in the browser bundle | Pass    | No key value in client JavaScript. (`sb_secret_` appears once as Supabase's own guard that _refuses_ secret keys in browsers.)                                                                                    |
| Security headers              | Pass    | `X-Frame-Options: DENY`, `nosniff`, referrer policy, permissions policy, HSTS, and a Content Security Policy in production                                                                                        |
| CSP in a real browser         | Pass    | Pages, images, hydration, Supabase calls, Server Actions and the admin charts all work under the policy                                                                                                           |
| Row Level Security            | Pass    | RLS on all 13 tables; anon cannot read private tables; catalogue writes are refused for insert, update and delete                                                                                                 |
| Function permissions          | Pass    | `create_booking`, `cancel_booking`, all `admin_*` refuse signed-out callers; public read-only functions work                                                                                                      |
| Private schema                | Pass    | `private` is not exposed through the API                                                                                                                                                                          |
| Visitors see only published   | Pass    | Live probe: every visible hotel is published and not archived                                                                                                                                                     |
| Authentication / redirects    | Pass    | Guests are redirected to login on all protected routes; open-redirect guard rejects 10 hostile `next` values                                                                                                      |
| Authorization                 | Pass    | Regular users get a 404 on every admin page; admin Server Actions re-check the role; database functions check `is_admin()`                                                                                        |
| Booking abuse                 | Pass    | Tampered price/status/user fields are ignored, past/reversed/too-long dates, too many guests, sold-out room, double submit, other user's reference — all rejected (SQL tests, logic tests and live browser tests) |
| Data isolation                | Partial | Verified by database tests and explicit `user_id` filters; **not** verified with two real logged-in accounts (see below)                                                                                          |

### Functionality (master document §12)

| Feature                                                | Result                                                              |
| ------------------------------------------------------ | ------------------------------------------------------------------- |
| Homepage, navigation, mobile menu, footer              | Pass                                                                |
| Destination listing, search and details                | Pass                                                                |
| Hotel search, filters, sorting, pagination             | Pass (2,934 combinations identical to the original logic, Phase 6)  |
| Hotel details, room selection, dates, guests           | Pass                                                                |
| Registration, login, logout, password reset            | Pass in Phase 5 (reset needs one browser; email limit 2/hour)       |
| Saved hotels                                           | Pass (save, reload, remove, list, empty state)                      |
| Booking flow, price calculation, confirmation, history | Pass                                                                |
| Booking cancel (user) and status changes (admin)       | Pass                                                                |
| Profile editing, password change form                  | Pass (password change not run on the live account)                  |
| Admin: overview, hotels, rooms, bookings, users        | Pass (promoting another user and creating a new hotel not run live) |

### Responsive and accessibility

| Check                                          | Result                                                                                                        |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| No horizontal scroll at 375 px                 | Pass on 15 pages (public, account, booking, admin). One bug found and fixed: admin pages overflowed by 104 px |
| Tablet (768 px)                                | Pass on hotels, hotel details, dashboard, admin bookings                                                      |
| `lang`, one `h1`, one `main`, no heading skips | Pass on 11 pages                                                                                              |
| Image alt text, control names, form labels     | Pass (every image has `alt`; every control has a name or a `label`)                                           |
| Duplicate ids                                  | None                                                                                                          |
| Keyboard / screen reader / colour contrast     | Built on accessible Radix components and WCAG-AA colour pairs (Phase 2); not re-audited with a screen reader  |

### Performance

| Measure                                 | Result                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------ |
| Server response time (production build) | 6–27 ms for cached pages                                                       |
| First-load JavaScript, compressed       | Home 397 KB → **332 KB** after this phase; `/about` 256 KB                     |
| Database queries                        | Search, filters and paging run in one SQL function; catalogue reads are cached |
| Supabase advisors                       | No errors (see findings below)                                                 |

Optimisation made: the Supabase browser library (68 KB compressed) was loaded on every page just to colour the heart buttons. Saved hotel ids now come from a Server Action, so signed-out visitors no longer download it.

## Bugs found and fixed in this phase

1. **Admin pages overflowed phones by 104 px.** Wide tables stretched the page grid. Fixed with `minmax(0, 1fr)` columns.
2. **Profile form rejected valid phone numbers** starting with a bracket, such as `(022) 1234-5678`. Fixed the pattern.
3. **Supabase browser client shipped to every visitor.** Replaced by a Server Action (see above).
4. **Stale comment** in `.env.example` about the secret key.

## Known findings and limitations

- **Supabase "SECURITY DEFINER function executable" warnings** (`create_booking`, `cancel_booking`, `admin_set_booking_status`, `admin_set_user_role`, `get_room_availability`): intentional and documented. Each requires a signed-in user and acts only for `auth.uid()` (or is admin-only, or returns counts only).
- **"Multiple permissive policies" (10 warnings) and unused indexes (9 notes):** harmless at demo scale (tens of rows). Merging the policies is a possible later optimisation; the unused indexes are the foreign-key indexes the app will need as data grows.
- **Leaked password protection is off.** This is a Supabase Auth setting (it may require a paid plan). Enable it in Authentication → Providers → Email if available.
- **Content Security Policy uses `'unsafe-inline'` for scripts and styles.** Next.js needs it without per-request nonces, and nonces would turn every page dynamic and lose caching. It still blocks framing, foreign scripts, foreign connections and plugins.
- **Two-account isolation test:** done with database tests and explicit filters, not two real logins (accounts must be created by the owner). To check by hand: register a second account and confirm each account's bookings, saved hotels and profile are separate.
- **Not exercised:** a real network outage (the error boundary exists but was not triggered), screen-reader walkthrough, Lighthouse scores (no Lighthouse run was possible in this environment).
- **Automated browser tests (Playwright) and a test framework (Vitest)** were not added; proposed, awaiting a decision.

## Lighthouse (Phase 12 follow-up, production build, mobile emulation)

Run with Lighthouse 12 against `next start` on localhost (simulated slow 4G, 4x CPU slowdown).

| Page          | Performance | Accessibility | Best practices | SEO                       |
| ------------- | ----------- | ------------- | -------------- | ------------------------- |
| Home          | 80          | 100           | 96             | 100                       |
| Hotels        | 81          | 100           | 96             | 100                       |
| Hotel details | 79          | 100           | 96             | 100                       |
| Login         | 90          | 100           | 96             | 60 (`noindex` on purpose) |

Fixed after the first run: footer text contrast, heading order on the hotels list, an invalid `<dl>` on hotel pages,
and the first result photo being lazy-loaded. What is left: Largest Contentful Paint is 4.5–5 s in the simulation
(the big photo comes from Unsplash through `next/image`; the real load on a normal connection is far quicker), plus
framework JavaScript that Next.js ships. Pages are already prerendered and cached.
