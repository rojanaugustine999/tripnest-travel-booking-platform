# TripNest — Development Roadmap

TripNest is a full-stack travel booking platform. Travellers browse destinations
and tour packages, book trips for chosen dates and group sizes, and manage their
bookings from a personal dashboard. Administrators manage the catalogue, review
and update bookings, and monitor the business from an admin dashboard.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 ·
Supabase (Postgres, Auth, Storage, Row Level Security) · GitHub · Vercel.

Development runs one phase at a time. Each phase ends with testing and an
explicit approval before the next phase begins.

---

## Phase 1 — Project Setup & Foundation

- **Objective:** A clean, scalable codebase with the design system and the
  app shell that every later page reuses.
- **Tasks:** Scaffold Next.js + TypeScript + Tailwind; ESLint + Prettier; folder
  architecture; brand design tokens (colours, fonts, radii, shadows); `cn()`
  utility; base UI components (Button, Container, Logo); responsive Navbar with
  mobile menu; Footer; site config (nav, metadata); 404 page; foundation home
  page; `.env.example`; README; local git repository.
- **Tech:** Next.js, TypeScript, Tailwind 4, lucide-react, clsx, tailwind-merge.
- **Files:** `src/app/*`, `src/components/{ui,layout}/*`, `src/config/site.ts`,
  `src/lib/utils.ts`, `src/types/*`, `docs/ROADMAP.md`, `.env.example`.
- **Depends on:** nothing.
- **Verify:** `npm run lint`, `npx tsc --noEmit`, `npm run build` pass; the
  page renders at desktop and phone widths; mobile menu opens and closes.
- **Result:** A running, branded app shell.

## Phase 2 — Public Pages & UI/UX

- **Objective:** The marketing face of TripNest.
- **Tasks:** Home page (hero with search bar, featured destinations, popular
  packages, why-choose-us, testimonials, newsletter CTA); About; Contact (form UI
  with validation); FAQ; Terms / Privacy; shared cards (DestinationCard,
  PackageCard), section headers, rating stars. Uses typed mock data shaped like
  the future database rows so Phase 5 can swap the source without UI changes.
- **Tech:** Server Components, next/image, Tailwind.
- **Files:** `src/app/(public)/*`, `src/components/{home,cards,shared}/*`,
  `src/data/mock/*`.
- **Depends on:** Phase 1 shell and tokens.
- **Verify:** Responsive check at 375 / 768 / 1280 px, Lighthouse accessibility,
  no layout shift, build passes.
- **Result:** A complete, polished public website (static data).

## Phase 3 — Supabase Setup & Database Design

- **Objective:** The data foundation for the full booking workflow.
- **Tasks:** Supabase project; SQL migrations for `profiles`, `destinations`,
  `packages`, `package_images`, `package_availability`, `bookings`,
  `booking_travelers`, `payments`, `reviews`, `wishlists`, `contact_messages`;
  enums (`user_role`, `booking_status`, `payment_status`); foreign keys and
  indexes; Row Level Security policies; triggers (profile on signup,
  `updated_at`); seed data; generated TypeScript types; server/browser Supabase
  clients.
- **Tech:** Supabase CLI, Postgres, `@supabase/supabase-js`, `@supabase/ssr`.
- **Files:** `supabase/migrations/*`, `supabase/seed.sql`,
  `src/lib/supabase/{server,client}.ts`, `src/types/database.ts`.
- **Depends on:** Phase 2 data shapes.
- **Verify:** Migrations apply cleanly; RLS tested with anon / user / admin
  roles; seed query returns data from the app.
- **Result:** A secure, relational database ready for features.

## Phase 4 — Authentication & Authorization

- **Objective:** Secure accounts with user and admin roles.
- **Tasks:** Sign up, sign in, sign out, forgot / reset password, email
  confirmation; session handling with `@supabase/ssr`; `proxy.ts` route
  protection for `/dashboard` and `/admin`; role checks on the server; auth-aware
  Navbar (avatar menu); form validation with Zod.
- **Files:** `src/app/(auth)/*`, `src/proxy.ts`, `src/lib/auth/*`,
  `src/actions/auth.ts`.
- **Depends on:** Phase 3 `profiles` table and clients.
- **Verify:** Each flow end to end; guests redirected from protected routes;
  users blocked from `/admin`.
- **Result:** Working, role-based authentication.

## Phase 5 — Destinations & Packages Catalogue

- **Objective:** Live, searchable travel catalogue.
- **Tasks:** `/destinations` and `/packages` listing with search, filters
  (destination, price range, duration, category, rating), sorting and
  pagination via URL params; destination and package detail pages (gallery,
  itinerary, inclusions, reviews, availability); wishlist toggle; SEO metadata
  and static params.
- **Depends on:** Phases 2–4.
- **Verify:** Filters reflect in URL and results; detail pages 404 on bad slugs;
  metadata present.
- **Result:** Real catalogue backed by Supabase.

## Phase 6 — Booking Workflow

- **Objective:** End-to-end booking.
- **Tasks:** Multi-step booking (dates & travellers → traveller details →
  review & price summary → payment step → confirmation); server-side price and
  availability recalculation; seat decrement in a transaction (Postgres
  function); booking reference codes; simulated / test-mode payment; confirmation
  page and email-ready summary.
- **Depends on:** Phases 3–5.
- **Verify:** Overbooking prevented; price cannot be tampered with from the
  client; status transitions correct.
- **Result:** Users can book trips.

## Phase 7 — User Dashboard

- **Objective:** Self-service for travellers.
- **Tasks:** Overview, My Bookings (upcoming / past, details, cancel within
  policy), wishlist, reviews for completed trips, profile and avatar upload
  (Supabase Storage), password change.
- **Depends on:** Phases 4 and 6.
- **Verify:** Users see only their own data (RLS); cancellation restores
  availability.
- **Result:** Complete traveller account area.

## Phase 8 — Admin Dashboard

- **Objective:** Operate the business.
- **Tasks:** Admin layout with sidebar; KPI cards and charts (revenue,
  bookings, top packages); CRUD for destinations and packages with image upload
  and availability management; booking management (confirm, cancel, refund
  status); user management (roles); reviews moderation; contact messages.
- **Depends on:** Phases 3–7.
- **Verify:** Every admin action checked server-side; non-admins rejected;
  CRUD round-trips.
- **Result:** Full admin control panel.

## Phase 9 — Security Hardening

- **Objective:** Production-grade security.
- **Tasks:** RLS audit; Zod validation on every Server Action; security headers
  and CSP; rate limiting on auth and contact forms; secrets audit (service-role
  key server-only); error boundaries without data leakage; dependency audit.
- **Verify:** Manual abuse tests, header scan, `npm audit`.
- **Result:** Hardened application.

## Phase 10 — Testing & Optimization

- **Objective:** Confidence and speed.
- **Tasks:** Unit tests (Vitest) for utilities and validation; component tests;
  end-to-end tests (Playwright) for auth and booking; image and bundle
  optimization; caching strategy; SEO (sitemap, robots, JSON-LD, OG images);
  accessibility pass.
- **Verify:** Test suites green; Lighthouse ≥ 90 across categories.
- **Result:** Tested, fast, accessible app.

## Phase 11 — GitHub & Vercel Deployment

- **Objective:** Live production release.
- **Tasks:** GitHub repository and push; branch strategy; GitHub Actions CI
  (lint, type-check, test, build); Vercel project with environment variables;
  Supabase production config (site URL, redirect URLs); custom domain (optional);
  post-deploy smoke test; final documentation.
- **Verify:** CI green; production booking flow works end to end.
- **Result:** TripNest live on Vercel.

---

## How the phases connect

Phase 1 sets the shell and design language → Phase 2 builds every public page on
it with data shaped like the database → Phase 3 creates that database → Phase 4
adds identity and roles on top of `profiles` → Phase 5 swaps mock data for live
queries → Phase 6 turns browsing into bookings → Phases 7 and 8 give users and
admins control over that data → Phases 9–10 harden and verify everything →
Phase 11 ships it.

## Planned architecture

```
src/
├─ app/
│  ├─ (public)/          home, about, contact, destinations, packages, faq
│  ├─ (auth)/            login, register, forgot/reset password
│  ├─ booking/           multi-step booking + confirmation
│  ├─ dashboard/         user dashboard (protected)
│  ├─ admin/             admin dashboard (protected, admin role)
│  ├─ api/               route handlers (webhooks, etc.)
│  ├─ layout.tsx · globals.css · not-found.tsx
├─ actions/              Server Actions (auth, booking, admin)
├─ components/
│  ├─ ui/                Button, Input, Card, Badge, Dialog …
│  ├─ layout/            Navbar, Footer, Sidebar
│  ├─ home/ cards/ booking/ dashboard/ admin/
├─ config/               site config, navigation
├─ data/                 mock data (Phase 2 only)
├─ hooks/                client hooks
├─ lib/                  utils, supabase clients, validation schemas, auth
├─ types/                domain + generated database types
└─ proxy.ts              route protection (Phase 4)
supabase/                migrations, seed
docs/                    roadmap and phase notes
```

## Testing strategy

Every phase: lint, type-check and production build must pass; the feature is
exercised in the browser at phone and desktop widths; phase-specific checks are
listed above. From Phase 10 automated tests run in CI on every push.
