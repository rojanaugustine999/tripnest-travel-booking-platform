# TripNest — Development Roadmap

> Source of truth: [MASTER_INSTRUCTIONS.md](MASTER_INSTRUCTIONS.md). This roadmap turns those requirements into
> 11 phases. If the two ever disagree, the master instructions win and this file gets updated.

## What we are building

TripNest is a full-stack **hotel booking platform** and portfolio project. Travellers discover destinations, search
and filter hotels, compare room types, select dates, guests and rooms, enter guest details and complete a clearly
labelled **demo booking** (no real payments, no real reservations). Signed-in users get a dashboard with booking
history, saved hotels and profile management. Administrators manage hotels, rooms, bookings and users from a
protected admin dashboard with statistics and charts.

**Stack:** Next.js 16 (App Router, Server Components, Server Actions, Route Handlers) · React 19 · TypeScript ·
Tailwind CSS 4 · shadcn/ui · Lucide icons · React Hook Form · Zod · date-fns · Recharts · Supabase (PostgreSQL, Auth,
Storage, Row Level Security) · Git + GitHub · Vercel. No separate Express backend.

**Ground rules (apply to every phase)**

- One phase at a time: **Complete → Test → Commit → Approval**. Never start the next phase without explicit
  approval; questions, explanations and screenshots are not approval.
- Before a phase: explain objective, tasks, files, technologies, dependencies, testing strategy, expected result.
- After a phase: summary, features, files created / modified, key code explained, commands run, test results,
  errors fixed, limitations, Git status, commit info, manual verification steps.
- Explain new libraries and important commands in simple English. Explain before adding any new npm script.
- Never push to GitHub, create the Supabase project, or deploy to Vercel without approval.
- Never touch `amazon-product-listing-roj` (folder, GitHub repo or Supabase project).
- Never commit secrets; only `.env.example` with placeholders. Service-role key stays server-only.
- Stay within the Supabase Free plan: lean queries, select only needed columns, pagination, compressed images.
- Clearly label anything simulated (demo bookings, sample data, demo revenue).

---

## Phase 1 — Project Inspection and Foundation ✅ (commit `326e04d`)

- **Objective:** A runnable, branded Next.js foundation.
- **Done:** Inspected directory; checked Node 24 / npm 11; Next.js 16 + TypeScript (strict) + Tailwind 4; ESLint +
  Prettier; initial design tokens; root layout with skip link; responsive Navbar with mobile menu; Footer; 404 page;
  `cn()` and `formatPrice()` utilities; site config; `.env.example`; README; roadmap; Git initialised.
- **Verified:** lint, typecheck, production build; desktop and 375 px; mobile menu; no horizontal scroll.
- **Known gaps carried into Phase 2/3:** primary colour is teal (master asks for navy primary + teal secondary);
  navigation still says "Packages" instead of "Hotels"; shadcn/ui not yet installed. These are fixed in Phase 2
  without rewriting the Phase 1 commit.

## Phase 2 — UI Foundation and Design System ✅

- **Objective:** A consistent, accessible component library that every later page is built from.
- **Tasks:**
  - Refine design tokens to the master palette: navy primary, teal secondary, coral accent, white / light-grey
    backgrounds, charcoal text, subtle grey borders; semantic tokens (success, warning, danger, muted).
  - Typography scale (headings, body, weights, line heights, letter spacing, button text).
  - Install and configure **shadcn/ui** on top of Tailwind 4, mapped to TripNest tokens.
  - Components: Button, Input, Textarea, Label, Select, Checkbox, Card, Badge, Dialog, Dropdown Menu, Sheet (mobile
    nav), Popover, Calendar / date picker (date-fns), Skeleton, Separator, Tooltip, Toast, Rating stars, Section
    heading, Empty state.
  - Navigation components: update Navbar (Home, Destinations, Hotels, About, Contact), accessible mobile Sheet,
    user-menu placeholder; Footer link groups aligned with the new site map.
  - Responsive layout primitives (Container, Section, Grid helpers) and subtle animation / transition utilities.
  - Accessibility standard: focus rings, keyboard support, labels, contrast check (WCAG AA).
  - Internal `/design-system` preview page to review every component (removed or hidden before deploy).
- **Tech:** Tailwind 4, shadcn/ui (Radix primitives), Lucide, date-fns.
- **Files:** `src/components/ui/*`, `src/components/layout/*`, `src/components/common/*`, `src/app/globals.css`,
  `src/config/site.ts`, `components.json`.
- **Depends on:** Phase 1.
- **Verify:** lint / typecheck / build; every component on the preview page at 375 / 768 / 1280 px; keyboard-only
  walk-through of dialog, dropdown, date picker and mobile menu; contrast check.
- **Result:** A complete, documented design system; no feature pages yet.

## Phase 3 — Public Website and Frontend ✅

- **Status:** done. Pages: home, destinations (+ details), hotels (+ details with room selection), about, contact.
  Search / filters / sort / pagination run through `features/hotels/lib` on sample data. Save hotel, newsletter,
  contact and Reserve are clearly labelled demos until Phases 4–7.

- **Objective:** The complete public experience, working against realistic sample data.
- **Tasks:**
  - **Homepage:** header, hero with travel image, search bar (destination, check-in, check-out, guests, rooms,
    search), popular destinations, featured hotels, special offers, why choose TripNest, testimonials, newsletter,
    footer.
  - **Destinations:** listing (cards, image, name, country, description, search, popular section); details (hero,
    description, attractions, travel info, recommended hotels, related destinations).
  - **Hotels:** listing with hotel cards (image, name, location, stars, review score + count, price per night,
    amenities, description, view details, save button); search by destination / city / hotel name; filters (price
    min/max, star rating, guest rating, amenities, accommodation type, availability); sorting (price ↑, price ↓,
    highest rated, most popular, recommended). Search, filter and sort state in URL params and **actually working**.
  - **Hotel details:** gallery, description, stars, reviews, amenities, facilities, room options (type, description,
    max occupancy, beds, amenities, price), check-in / check-out times, cancellation info, availability, booking
    button; room selection UI with clear selected state.
  - About and Contact pages; loading, empty and not-found states.
  - Typed sample data (`features/*/data`) shaped exactly like the Phase 4 tables, accessed through a data-access
    layer so Phase 6 swaps the source without touching UI.
- **Tech:** Server Components, `next/image`, URL search params, React Hook Form + Zod (newsletter / contact forms).
- **Files:** `src/app/(public)/*`, `src/features/{destinations,hotels,rooms}/*`, `public/images/*`.
- **Depends on:** Phase 2 components.
- **Verify:** each filter and sort combination changes results correctly; search works; invalid slugs show 404;
  responsive at 375 / 768 / 1280 px; no horizontal scroll; images have alt text.
- **Result:** A fully navigable, realistic public website (sample data, clearly labelled).

## Phase 4 — Supabase Setup and Database ✅

- **Status:** done. Project `tripnest` (Mumbai, Free plan) created; 3 migrations (13 tables, functions/triggers,
  RLS + grants) applied; sample data loaded and checksum-verified; types generated; `npm run db:check` and the
  Security Advisor pass. Optional policy-merge optimisation (Performance Advisor `multiple_permissive_policies`)
  was skipped by choice — revisit in Phase 10.

- **Objective:** A reproducible, secure PostgreSQL database for the whole booking workflow.
- **Tasks:**
  - Step-by-step guide for you to create the separate **`tripnest`** Supabase project (Free plan, second slot).
  - `.env.local` (you fill it in locally), Supabase browser / server clients with `@supabase/ssr`.
  - SQL migrations in `supabase/migrations/`: `profiles` (with `role`), `destinations`, `hotels` (published flag,
    archived flag), `hotel_images`, `amenities`, `hotel_amenities`, `rooms` (room types with price, occupancy, beds,
    unit count), `bookings` (reference, user, hotel, room, dates, guests, rooms, price snapshot, taxes, fees, total,
    status, idempotency key, timestamps), `booking_guests`, `saved_hotels` (unique user + hotel), `reviews`, plus
    `newsletter_subscribers` and `contact_messages` if the Phase 3 forms need storage.
  - UUID keys, foreign keys, check / unique constraints, indexes, timestamps, sensible `on delete` behaviour.
  - Functions / triggers: profile on signup, `updated_at`, `is_admin()` helper, guard preventing users from changing
    their own role.
  - RLS on every protected table (own profile / bookings / guests / saved hotels; public read of published hotels;
    admin-only inventory and booking management).
  - `supabase/seed.sql` with realistic sample destinations, hotels, rooms, amenities and reviews (labelled sample).
  - Generated TypeScript database types.
- **Tech:** Supabase, PostgreSQL, Supabase CLI (optional), `@supabase/supabase-js`, `@supabase/ssr`.
- **Files:** `supabase/migrations/*`, `supabase/seed.sql`, `src/lib/supabase/*`, `src/types/database.ts`.
- **Depends on:** Phase 3 data shapes.
- **Verify:** migrations run cleanly on the empty project; seed loads; app reads data; RLS tested as anon, user and
  admin (including a user attempting to read another user's booking or set their own role).
- **Result:** Live database with secure policies and sample data.

## Phase 5 — Authentication and Authorization ✅

- **Status:** done. Verified live: sign-up, email confirmation, log in, log out, guests
  redirected from account pages, non-admin gets 404 on `/admin`. Password-reset request and email link verified
  up to the code exchange (the full reset was blocked by the 2-emails/hour limit; the exchange logic was verified
  in a simulation). Still to check manually: the wrong-password message, one complete reset in a single browser, and `/admin` as an admin
  after running the SQL in SUPABASE_SETUP. Non-admins get a 404 (`forbidden()` is still experimental).

- **Objective:** Secure accounts and role-based access.
- **Tasks:** registration, login, logout, password reset (request + update), email confirmation callback, profile
  creation, auth state in Navbar (user menu), session refresh via `proxy.ts`, protected `(user)` routes and `admin`
  route, server-side role checks (`requireUser`, `requireAdmin`), Zod-validated forms with clear error messages.
- **Tech:** Supabase Auth, `@supabase/ssr`, Server Actions, React Hook Form, Zod.
- **Files:** `src/app/(auth)/*`, `src/app/auth/confirm`, `src/proxy.ts`, `src/lib/auth/session.ts`, `src/features/auth/*`,
  `src/lib/validations/auth.ts`.
- **Depends on:** Phase 4 (`profiles`, clients).
- **Verify:** each flow end to end; wrong password / duplicate email errors; guests redirected from protected
  routes; ordinary users blocked from `/admin` on the server.
- **Result:** Working authentication with user and admin roles.

## Phase 6 — Hotel and Destination Data Integration ✅

- **Objective:** Replace sample data with live Supabase data.
- **Tasks:** destination, hotel, image, amenity and room queries; search, filter and sort as database queries;
  pagination; save / unsave hotel (signed-in users, no duplicates); loading skeletons, empty states, error
  boundaries; caching and revalidation; selecting only required columns.
- **Tech:** Server Components, `use cache` / revalidation, Supabase queries, Supabase Storage images.
- **Files:** `src/features/*/queries.ts`, `src/features/saved-hotels/*`, public route pages (data source only).
- **Depends on:** Phases 3–5.
- **Verify:** results match the database for every filter / sort; pagination; save button respects auth; error
  and empty states display; no unnecessary requests.
- **Result:** Public website fully database-driven.
- **Status:** Done. Search/filter/sort/pagination run in the `search_hotels` SQL function (verified identical to the Phase 3 logic on 2,934 combinations). Hotel images still use Unsplash URLs; Supabase Storage is not used yet. The saved-hotels page itself is still a placeholder (Phase 8 dashboard).

## Phase 7 — Booking Workflow ✅

- **Objective:** End-to-end demo booking.
- **Tasks:** multi-step flow: hotel → room → dates → guests / rooms → guest information → review → confirm demo
  booking → confirmation page with booking reference. Price breakdown (room price, nights, rooms, subtotal, taxes,
  fees, total) shown on the client but **recalculated on the server**. Validation of dates, guest limits and room
  availability (Postgres function with overlap check and locking to prevent overbooking); idempotency key to prevent
  duplicate submissions; price snapshot stored on the booking; "Demo booking — no payment taken" labelling
  throughout. No card details collected.
- **Tech:** Server Actions, Zod, React Hook Form, date-fns, Postgres function.
- **Files:** `src/app/booking/*`, `src/app/confirmation/*`, `src/features/bookings/*`,
  `supabase/migrations/*_booking_functions.sql`.
- **Depends on:** Phases 4–6.
- **Verify:** valid booking succeeds; past / reversed dates, too many guests, sold-out room, tampered price and
  double-submit are all rejected; booking appears in the database with the correct snapshot.
- **Result:** Users can complete demo bookings.
- **Status:** Done. The `create_booking` SQL function is the only way to make a booking (locks the room, checks every
  night, recalculates the price, idempotent). Taxes are a flat 12% demo GST, no fees. Search results do not filter by
  dates yet; the hotel page and booking page show live availability for chosen dates. Cancelling a booking comes with
  the Phase 8 dashboard.

## Phase 8 — User Dashboard

- **Objective:** Self-service area for signed-in users.
- **Tasks:** overview (upcoming trip, counts), My bookings (reference, hotel, image, room type, dates, nights,
  guests, total, status), booking details, saved hotels (view, remove, open details), profile (full name, email
  display, phone, profile image via Supabase Storage), account settings (password change); clear empty states.
- **Tech:** Server Components, Server Actions, Supabase Storage, Zod.
- **Files:** `src/app/(user)/*`, `src/features/{profile,saved-hotels,bookings}/*`.
- **Depends on:** Phases 5–7.
- **Verify:** a user only ever sees their own data (tested with two accounts); profile validation; image upload
  limits; empty states.
- **Result:** Complete user dashboard.

## Phase 9 — Admin Dashboard

- **Objective:** Protected control panel for administrators.
- **Tasks:** admin layout and sidebar; overview (total hotels, rooms, bookings, users, **demo** revenue, booking
  statistics, recent bookings, popular hotels) with Recharts; hotel management (add, edit, archive / delete,
  publish / unpublish, descriptions, images, amenities); room management (add, edit, prices, occupancy,
  availability); booking management (list, details, filters, permitted status updates); user management (list,
  details, role changes by admins only). All operations authorised on the server and by RLS.
- **Tech:** Recharts, Server Actions, React Hook Form, Zod, Supabase Storage.
- **Files:** `src/app/admin/*`, `src/features/admin/*`.
- **Depends on:** Phases 4–8.
- **Verify:** every CRUD action round-trips; non-admins rejected at server and database level; demo figures
  labelled.
- **Result:** Fully working admin dashboard.

## Phase 10 — Security, Testing and Optimization

- **Objective:** Prove the application is secure, correct and fast.
- **Tasks:** RLS policy review and tests; authentication and authorization tests; booking abuse tests; environment
  variable / secret audit; security headers; full functional checklist (master §12); responsive check (desktop,
  tablet, 375 px); error states (loading, empty, network, invalid forms, auth, database, booking); image, query,
  bundle and caching optimisation; accessibility pass; lint, typecheck and build. Automated tests (e.g. Vitest /
  Playwright) only if approved when proposed.
- **Depends on:** Phases 1–9.
- **Verify:** checklist fully passed and documented; Lighthouse performance and accessibility reviewed.
- **Result:** Production-ready application.

## Phase 11 — GitHub and Vercel Deployment

- **Objective:** Publish TripNest as a portfolio project.
- **Tasks:** codebase review; final README (introduction, objectives, features, stack, screenshots, folder
  structure, installation, environment setup, Supabase setup, migrations, running locally, testing, deployment);
  screenshots; verify `.gitignore` and secrets; create the separate `tripnest-travel-booking-platform` repository
  under `rojanaugustine999`; push **with approval**; Vercel guide (connect repo, import, env vars, Supabase redirect
  URLs, deploy, verify, troubleshoot); deploy **with approval**; verify the live site.
- **Depends on:** Phase 10.
- **Verify:** live site passes a smoke test of auth, search, booking, dashboard and admin.
- **Result:** TripNest live on Vercel and in the portfolio.

---

## How the phases connect

Phase 1 gives a runnable shell → Phase 2 builds the design system every page uses → Phase 3 builds all public
pages on sample data shaped like the database → Phase 4 creates that database with security rules → Phase 5 adds
accounts and roles on `profiles` → Phase 6 swaps sample data for live queries → Phase 7 turns hotel browsing into
bookings → Phases 8 and 9 let users and admins manage that data → Phase 10 proves it is secure and fast → Phase 11
ships it.

## Planned architecture

```
public/images · public/icons · public/logo
docs/                      MASTER_INSTRUCTIONS.md · ROADMAP.md
src/
├─ app/
│  ├─ (public)/            home, destinations, hotels, about, contact
│  ├─ (auth)/              login, register, forgot-password, reset-password
│  ├─ (user)/              dashboard, bookings, saved-hotels, profile
│  ├─ admin/               admin dashboard (server-side admin check)
│  ├─ booking/             multi-step demo booking
│  ├─ confirmation/        booking confirmation
│  ├─ api/                 route handlers (auth callback, etc.)
│  ├─ layout.tsx · globals.css · not-found.tsx
├─ components/
│  ├─ ui/                  shadcn/ui primitives
│  ├─ layout/              Navbar, Footer, admin / user sidebars
│  ├─ common/ · shared/    cross-feature pieces (rating, empty state, section heading)
├─ features/               destinations, hotels, rooms, bookings, auth, profile, saved-hotels, admin
│                          (each: components, queries, actions, types, data)
├─ lib/                    supabase/, utils/, validations/
├─ hooks/ · types/ · config/
└─ proxy.ts                session refresh + route protection (Phase 5)
supabase/                  migrations/, seed.sql
```

Data flow: page (Server Component) → `features/*/queries.ts` → Supabase (RLS enforced) → typed result → UI
components. Mutations: form (React Hook Form + Zod) → Server Action (Zod again + auth / role check) → Supabase →
revalidate.

## Testing strategy

Every phase: `npm run lint`, `npm run typecheck`, `npm run build`; manual checks in the browser at 375 / 768 / 1280 px;
the phase-specific checks above; Git checkpoint commit. Security and RLS are tested with real anon, user and admin
sessions, not assumed.

## Revision history

- **v1 (Phase 1, `326e04d`)** — roadmap inferred before the master instructions were available.
- **v2** — rewritten against `MASTER_INSTRUCTIONS.md`: hotel / room booking model instead of tour packages; phase
  order and scope matched to master §14; added shadcn/ui, React Hook Form, Zod, date-fns, Recharts; navy / teal /
  coral palette; feature-based folders; demo-booking rules; Free-plan and approval rules.
