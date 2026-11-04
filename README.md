# TripNest — Travel Booking Platform

A full-stack hotel booking platform built with Next.js, TypeScript, Tailwind CSS, shadcn/ui and Supabase.
See [docs/ROADMAP.md](docs/ROADMAP.md) for the 11-phase development plan and
[docs/MASTER_INSTRUCTIONS.md](docs/MASTER_INSTRUCTIONS.md) for the full requirements.

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The internal component style guide is at http://localhost:3000/design-system.

## Scripts

| Script                     | Purpose                                                                         |
| -------------------------- | ------------------------------------------------------------------------------- |
| `npm run dev`              | Start the dev server                                                            |
| `npm run build`            | Production build                                                                |
| `npm run start`            | Serve the production build                                                      |
| `npm run lint`             | ESLint                                                                          |
| `npm run typecheck`        | TypeScript type-check                                                           |
| `npm run format`           | Format with Prettier                                                            |
| `npm run test:logic`       | Check validators, price maths and the redirect guard with hostile input         |
| `npm run db:check`         | Test the live Supabase project as a signed-out visitor (reads `.env.local`)     |
| `npm run db:security`      | Probe the live database like an attacker (reads, writes, functions)             |
| `npm run db:push`          | Apply new migrations to the linked Supabase project (`-- --dry-run` to preview) |
| `npm run db:types`         | Regenerate `src/types/database.ts` from the linked project                      |
| `npm run db:seed:generate` | Rebuild `supabase/seed.sql` from the sample data                                |

## Project structure

```
src/
├─ app/
│  ├─ (public)/      home, destinations, hotels, about, contact
│  └─ design-system/ internal style guide page
├─ components/
│  ├─ ui/           shadcn/ui primitives styled with TripNest tokens
│  ├─ common/       shared pieces (Section, PageHeader, Breadcrumbs, Pagination, DateRangePicker, GuestRoomPicker…)
│  └─ layout/       Navbar, UserMenu, Footer
├─ features/
│  ├─ destinations/ data, queries, cards, search
│  ├─ hotels/       data, queries, search params, filter/sort logic, cards, filters, gallery
│  ├─ rooms/        room data, room cards and selection
│  ├─ saved-hotels/ save button
│  └─ marketing/    newsletter, contact form, testimonials
├─ config/          site config and navigation
├─ lib/             utils (cn, formatPrice, text, images), validations (Zod), supabase/ (browser + server clients)
└─ types/           domain types, and database.ts generated from the live schema
supabase/           config.toml, migrations/ (schema, functions, RLS + grants), seed.sql (sample data)
scripts/            generate-seed.ts, check-supabase.mts
docs/               master instructions, roadmap, Supabase setup guide
```

## Supabase database

TripNest uses its own Supabase project (`tripnest`, Mumbai region, Free plan). Setup steps, the table list and
the security model are in [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).

- **13 tables** covering the whole booking workflow (profiles, destinations, hotels, images, amenities, rooms,
  bookings with a price snapshot, guests, saved hotels, reviews, newsletter, contact messages).
- **Row Level Security on every table** plus explicit per-role grants. Users only ever see their own profile,
  bookings and saved hotels; only admins manage the catalogue; bookings are never written directly from the browser.
- Environment: copy `.env.example` to `.env.local` and add the project URL and **publishable** key. The secret key
  is server-only and never committed.

## Authentication

Supabase Auth with email + password (`@supabase/ssr`, Server Actions, Zod validation):

- `/register`, `/login`, `/forgot-password`, `/reset-password`; email links land on `/auth/confirm`.
- `src/proxy.ts` refreshes the session on every request and redirects guests away from account pages.
- `requireUser()` / `requireAdmin()` in `src/lib/auth/session.ts` protect pages on the server using the
  verified `getClaims()` check and `profiles.role` from the database.
- User area: `/dashboard`, `/bookings`, `/saved-hotels`, `/profile`. Admin area: `/admin` (404 for non-admins).
- Make an account admin in the Supabase SQL Editor — see [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).

## Demo booking

Signed-in users can book a room: guest details, review, confirm, then a confirmation page with a reference. **No payment
is taken and no real hotel is contacted.** The browser only sends the stay and guest details; the `create_booking`
database function validates them, checks availability under a lock, works out the price (12% demo GST) and saves it
with the booking.

## Sample data

The public pages read live data from Supabase (hotel search runs in the `search_hotels` SQL function; catalogue reads are
cached with `use cache`). The typed sample files in `src/features/*/data` are now only the source for `supabase/seed.sql`
(`npm run db:seed:generate`).
Photos are from Unsplash (free to use under the Unsplash licence). All hotels, prices and reviews are fictional.

## Design system

- **Colours:** navy (primary), lagoon teal (secondary), coral (main call to action), slate neutrals. Defined in
  `src/app/globals.css`; text/background pairs meet WCAG AA contrast.
- **Typography:** Plus Jakarta Sans (headings) and Inter (body) with a `text-display` / `text-h1`–`text-h4` /
  `text-lead` / `text-eyebrow` scale.
- **Components:** shadcn/ui on Radix primitives (keyboard and screen-reader accessible), Lucide icons, date-fns
  calendar.
