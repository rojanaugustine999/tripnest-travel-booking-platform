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

| Script              | Purpose                    |
| ------------------- | -------------------------- |
| `npm run dev`       | Start the dev server       |
| `npm run build`     | Production build           |
| `npm run start`     | Serve the production build |
| `npm run lint`      | ESLint                     |
| `npm run typecheck` | TypeScript type-check      |
| `npm run format`    | Format with Prettier       |

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
├─ lib/             utils (cn, formatPrice, text, images), validations (Zod)
└─ types/           domain types mirroring the planned database
docs/               master instructions and roadmap
```

## Sample data

Until Supabase is connected (Phase 4/6), destinations, hotels, rooms and reviews come from typed sample data in
`src/features/*/data`. Pages only call the async functions in `features/*/queries.ts`, so switching to the
database does not change any page. Photos are from Unsplash (free to use under the Unsplash licence).

## Design system

- **Colours:** navy (primary), lagoon teal (secondary), coral (main call to action), slate neutrals. Defined in
  `src/app/globals.css`; text/background pairs meet WCAG AA contrast.
- **Typography:** Plus Jakarta Sans (headings) and Inter (body) with a `text-display` / `text-h1`–`text-h4` /
  `text-lead` / `text-eyebrow` scale.
- **Components:** shadcn/ui on Radix primitives (keyboard and screen-reader accessible), Lucide icons, date-fns
  calendar.
