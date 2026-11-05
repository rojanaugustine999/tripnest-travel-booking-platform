# TripNest — Travel Booking Platform

A full-stack hotel booking platform built as a portfolio project: search and compare hotels, choose a room, complete a
**demo** booking, manage your trips, and run the whole thing from an admin dashboard.

**Live demo:** <https://tripnest-travel-booking-platform.vercel.app>

> **Demo project.** All hotels, prices and reviews are fictional sample data, and bookings are demonstrations only.
> **No real money is taken and no real hotel is contacted** (optional Razorpay _test-mode_ payments are described in
> [docs/PAYMENTS.md](docs/PAYMENTS.md)). Photos are from Unsplash.

|                                                        |                                                   |
| ------------------------------------------------------ | ------------------------------------------------- |
| ![Home page](docs/screenshots/home.jpg)                | ![Hotel search](docs/screenshots/hotels.jpg)      |
| ![Hotel details](docs/screenshots/hotel-details.jpg)   | ![User dashboard](docs/screenshots/dashboard.jpg) |
| ![Admin overview](docs/screenshots/admin-overview.jpg) |                                                   |

## Objectives

- Build a realistic, production-style booking platform end to end: public site, accounts, bookings and administration.
- Keep it **secure by design**: Row Level Security on every table, server-side validation and authorization, no secrets
  in the browser.
- Practise professional habits: typed code, small features, tests for the risky parts, documentation, a phase-by-phase
  history (see [docs/ROADMAP.md](docs/ROADMAP.md)).

## Features

**Visitors**

- Destinations and hotels with search (accent-insensitive), filters (price, stars, rating, type, amenities,
  availability), sorting and pagination — all computed in one SQL function.
- Hotel pages with gallery, amenities, policies, reviews, room comparison and live availability for chosen dates.

**Signed-in users**

- Registration, login, password reset (Supabase Auth), profile and password change.
- Save hotels (no duplicates), view and remove them.
- Demo booking: guest details → review → confirm → confirmation with a reference. The price is calculated **on the
  server**, availability is checked under a database lock (no overbooking), and a repeated submission cannot create
  two bookings.
- Optional **Razorpay test-mode payment**: the booking is held for 15 minutes and confirmed only after the payment's
  signature is verified **inside the database** (see [docs/PAYMENTS.md](docs/PAYMENTS.md)). Off by default.
- My bookings with details, price snapshot and cancellation of future bookings.

**Administrators**

- Overview with statistics and charts (demo revenue is clearly labelled).
- Hotels (add, edit, publish, archive, images, amenities), rooms (prices, occupancy, availability), bookings
  (filters, permitted status changes) and users (role changes, never your own).

## Technology stack

| Area       | Technology                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Cache Components, Server Actions, `proxy.ts`), React 19, TypeScript |
| Styling/UI | Tailwind CSS 4, shadcn/ui on Radix, Lucide icons, Recharts (admin charts)                   |
| Forms      | React Hook Form + Zod (validated in the browser **and** again on the server)                |
| Backend    | Supabase: PostgreSQL, Auth, Row Level Security, SQL functions (`@supabase/ssr`)             |
| Tooling    | ESLint, Prettier, `tsx` scripts for security/logic checks                                   |
| Hosting    | Vercel (see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md))                                       |

## Getting started

Requirements: **Node.js 20.9 or newer**, npm, and a free [Supabase](https://supabase.com) account.

```bash
git clone https://github.com/rojanaugustine999/tripnest-travel-booking-platform.git
cd tripnest-travel-booking-platform
npm install
cp .env.example .env.local
```

### 1. Create the Supabase project and load the database

Follow [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md). In short:

1. Create a new Supabase project (leave "automatically expose new tables" **off**).
2. Run the SQL files in `supabase/migrations/` **in order**, then `supabase/seed.sql` (sample data), using either the
   Supabase CLI (`npm run db:push`) or the dashboard SQL Editor.
3. Put the **Project URL** and **publishable key** in `.env.local`. Never use the secret key in the browser and never
   commit `.env.local`.
4. Under Authentication → URL Configuration set the Site URL to `http://localhost:3000` and add
   `http://localhost:3000/**` as a redirect URL.

### 2. Run it

```bash
npm run dev      # http://localhost:3000
```

To try the admin area, register an account, then run this once in the Supabase SQL Editor (admin rights cannot be
granted from the website):

```sql
update public.profiles set role = 'admin' where email = 'your-email@example.com';
```

## Scripts and testing

| Script                     | Purpose                                                                         |
| -------------------------- | ------------------------------------------------------------------------------- |
| `npm run dev`              | Start the dev server                                                            |
| `npm run build`            | Production build                                                                |
| `npm run start`            | Serve the production build                                                      |
| `npm run lint`             | ESLint                                                                          |
| `npm run typecheck`        | TypeScript type-check                                                           |
| `npm run format`           | Format with Prettier                                                            |
| `npm test`                 | Vitest unit tests (redirect guard, prices, validators)                          |
| `npm run test:logic`       | Check validators, price maths and the redirect guard with hostile input         |
| `npm run db:check`         | Test the live Supabase project as a signed-out visitor (reads `.env.local`)     |
| `npm run db:security`      | Probe the live database like an attacker (reads, writes, functions)             |
| `npm run db:push`          | Apply new migrations to the linked Supabase project (`-- --dry-run` to preview) |
| `npm run db:types`         | Regenerate `src/types/database.ts` from the linked project                      |
| `npm run db:seed:generate` | Rebuild `supabase/seed.sql` from the sample data                                |

Results of the full security, functionality, responsive and performance review are in
[docs/TESTING.md](docs/TESTING.md).

## How it is secured

- **Row Level Security** on all 13 tables with explicit per-role grants. Users only see their own profile, bookings and
  saved hotels; only admins manage the catalogue.
- **Bookings cannot be written from the browser.** The `create_booking`, `cancel_booking` and `admin_*` SQL functions
  check who is calling, re-validate everything and are not executable by signed-out visitors.
- **Server-side authorization:** `requireUser()` / `requireAdmin()` and every Server Action check the verified session
  and the role stored in the database; admin pages return 404 to everyone else.
- **Headers:** CSP, `X-Frame-Options`, `nosniff`, referrer and permissions policies, HSTS.
- **Secrets:** only `.env.example` is committed. The Supabase secret key is not used by the app at all.

## Project structure

```
src/
├─ app/
│  ├─ (public)/      home, destinations, hotels, about, contact
│  ├─ (auth)/        login, register, password reset
│  ├─ (user)/        dashboard, bookings, saved hotels, profile
│  ├─ booking/       booking flow          confirmation/  booking confirmation
│  └─ admin/         overview, hotels, rooms, bookings, users
├─ components/       ui/ (shadcn), common/ (shared pieces), layout/ (navbar, footer)
├─ features/         destinations, hotels, rooms, bookings, saved-hotels, profile, auth, admin, marketing
├─ lib/              supabase/ clients, auth/ session helpers, validations/, utils/
├─ proxy.ts          session refresh + route protection
└─ types/            domain types and database.ts (generated from the live schema)
supabase/            migrations/ (schema, RLS, SQL functions), seed.sql (sample data)
scripts/             seed generator, db:check, db:security, test:logic
docs/                roadmap, Supabase setup, testing report, deployment guide, master instructions
```

## Deployment

Step-by-step instructions for GitHub and Vercel, including the Supabase settings you must change for the live site,
are in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Known limitations

- Real payments, real hotel inventory and custom emails are **not** implemented (it is a demo; Razorpay is test mode only). Supabase's built-in email service
  sends 2 emails per hour; use your own SMTP for more.
- Hotel images are Unsplash links, not uploads.
- Search results do not filter by dates (availability is shown on the hotel and booking pages).
- See [docs/TESTING.md](docs/TESTING.md) for everything that was and was not verified.

## Credits

Photography from [Unsplash](https://unsplash.com) under the Unsplash licence. Icons by Lucide. Built by Rojan
Augustine as a learning and portfolio project.
