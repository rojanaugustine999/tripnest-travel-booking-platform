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
├─ app/            routes, root layout, global styles (design tokens)
│  └─ design-system/  internal style guide page
├─ components/
│  ├─ ui/          shadcn/ui primitives styled with TripNest tokens
│  ├─ common/      shared pieces: Section, SectionHeading, RatingStars, EmptyState, DateRangePicker, FormField
│  └─ layout/      Navbar, UserMenu, Footer
├─ config/         site config and navigation
├─ lib/            utilities (cn, formatPrice)
└─ types/          shared TypeScript types
docs/              master instructions and roadmap
```

## Design system

- **Colours:** navy (primary), lagoon teal (secondary), coral (main call to action), slate neutrals. Defined in
  `src/app/globals.css`; text/background pairs meet WCAG AA contrast.
- **Typography:** Plus Jakarta Sans (headings) and Inter (body) with a `text-display` / `text-h1`–`text-h4` /
  `text-lead` / `text-eyebrow` scale.
- **Components:** shadcn/ui on Radix primitives (keyboard and screen-reader accessible), Lucide icons, date-fns
  calendar.
