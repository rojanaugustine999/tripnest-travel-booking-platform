# TripNest — Travel Booking Platform

A full-stack travel booking platform built with Next.js, TypeScript, Tailwind CSS and Supabase.
See [docs/ROADMAP.md](docs/ROADMAP.md) for the 11-phase development plan.

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

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
├─ app/            routes, root layout, global styles
├─ components/
│  ├─ ui/          reusable primitives (Button, Container, Logo)
│  └─ layout/      Navbar, Footer
├─ config/         site config and navigation
├─ lib/            utilities
└─ types/          shared TypeScript types
docs/              roadmap and phase notes
```
