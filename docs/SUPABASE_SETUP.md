# Supabase setup for TripNest

This guide creates a **separate** Supabase project for TripNest and loads the database.
It does not touch your existing `amazon-product-listing` project.

> **Keep secrets private.** Never paste your database password, secret key (`sb_secret_…`) or access token
> into chat, GitHub, screenshots or any public place. They go only into Supabase's own prompts, your terminal,
> or your local `.env.local` file (which Git ignores).

## Current status (4 November 2026)

| Item               | Value                                                                      |
| ------------------ | -------------------------------------------------------------------------- |
| Project            | `tripnest` (ref `cdpwcerbfsqibggnoazd`) in organization **Rojan Projects** |
| Region / plan      | `ap-south-1` South Asia (Mumbai) · Free                                    |
| Project URL        | `https://cdpwcerbfsqibggnoazd.supabase.co`                                 |
| Migrations applied | `initial_schema`, `functions_and_triggers`, `rls_policies_and_grants`      |
| Sample data        | Loaded and checksum-verified against `supabase/seed.sql`                   |
| `npm run db:check` | All 9 checks pass                                                          |
| Security Advisor   | No issues                                                                  |

Steps 1–4 below are already done; they stay here so the setup can be repeated (for example on a new
project). Step 5 is needed before Phase 5.

---

## Step 1 — Create the project (Dashboard, ~3 minutes)

1. Open <https://supabase.com/dashboard> and sign in with your existing account.
2. Choose your existing organization, then click **New project**.
3. Fill in:
   | Field             | Value                                                                                             |
   | ----------------- | ------------------------------------------------------------------------------------------------- |
   | Project name      | `tripnest`                                                                                        |
   | Database password | Click **Generate a password**, then save it in your password manager. You need it once in Step 3. |
   | Region            | **South Asia (Mumbai)** — closest to India, so pages load faster                                  |
   | Plan              | Free                                                                                              |
4. Open **Security options** (or **Advanced configuration**) if shown:
   - **Automatically expose new tables and functions → leave UNCHECKED.** Our migrations grant access table
     by table, so nothing is exposed by accident.
   - **Enable automatic RLS → ON** (if offered).
5. Click **Create new project** and wait until the status shows **Healthy** (1–2 minutes).

You now have 2 active projects on the Free plan (the maximum).

## Step 2 — Add the API details to `.env.local`

1. In the `tripnest` project, go to **Project Settings → API Keys**.
2. Copy the **Project URL** (`https://<project-ref>.supabase.co`) and the **Publishable key** (`sb_publishable_…`).
   Do **not** copy the secret key.
3. In VS Code, copy `.env.example` to a new file named `.env.local` in the project root and fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```
   The `<project-ref>` is the random part of the URL (also under **Project Settings → General → Project ID**).

## Step 3 — Load the database

Choose **one** option.

### Option A — Supabase CLI (recommended: repeatable, tracks which migrations ran)

Run these in the VS Code terminal, in the project folder:

```bash
npx supabase login
```

Opens your browser to authorise the CLI on this computer. The token is saved locally.

```bash
npx supabase link --project-ref <project-ref>
```

Connects this folder to the `tripnest` project. When asked, type the **database password** from Step 1.

```bash
npm run db:push -- --dry-run
```

Shows the 3 migrations that would run, without changing anything.

```bash
npm run db:push -- --include-seed
```

Creates the tables, security rules and functions, then loads the sample data. Answer `Y` to confirm.

### Option B — SQL Editor (no CLI)

In the Dashboard open **SQL Editor → New query**, then paste and **Run** each file's contents **in this order**:

1. `supabase/migrations/20261104041853_initial_schema.sql`
2. `supabase/migrations/20261104041914_functions_and_triggers.sql`
3. `supabase/migrations/20261104041946_rls_policies_and_grants.sql`
4. `supabase/seed.sql`

Each should end with "Success. No rows returned".

## Step 4 — Verify

```bash
npm run db:check
```

Expected: every line `PASS` and "All checks passed — Supabase is connected and secured."

Then in the Dashboard, **Table Editor** should list 13 tables, each marked with RLS enabled, and
**Advisors → Security Advisor** should show no errors.

## Step 5 — Auth URLs (used from Phase 5)

**Authentication → URL Configuration**:

- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** add `http://localhost:3000/**`

(The Vercel URL is added in Phase 11.)

## Making yourself an admin (later, after you register in Phase 5)

Admin rights can't be granted from the website. In the **SQL Editor**, run:

```sql
update public.profiles set role = 'admin' where email = 'your-email@example.com';
```

---

## What the database contains

| Table                                        | Purpose                                        | Who can read                            | Who can change                                          |
| -------------------------------------------- | ---------------------------------------------- | --------------------------------------- | ------------------------------------------------------- |
| `profiles`                                   | One per user (created automatically on signup) | Owner, admins                           | Owner (name, phone, photo only)                         |
| `destinations`                               | Places to visit                                | Everyone                                | Admins                                                  |
| `hotels`                                     | Hotels, offers, publish/archive status         | Everyone (published only), admins (all) | Admins                                                  |
| `hotel_images`                               | Hotel photo gallery                            | Everyone (published hotels)             | Admins                                                  |
| `amenities`, `hotel_amenities`               | Amenity list and which hotel has which         | Everyone                                | Admins                                                  |
| `rooms`                                      | Room types, prices, occupancy, inventory       | Everyone (published hotels)             | Admins                                                  |
| `bookings`                                   | Demo bookings with a price snapshot            | Owner, admins                           | Created by server functions (Phase 7); status by admins |
| `booking_guests`                             | Guest details per booking                      | Owner, admins                           | Server functions (Phase 7)                              |
| `saved_hotels`                               | Each user's favourites (no duplicates)         | Owner                                   | Owner                                                   |
| `reviews`                                    | Guest reviews                                  | Everyone (published)                    | Admins (user reviews later)                             |
| `newsletter_subscribers`, `contact_messages` | Public form submissions                        | Admins                                  | Anyone can submit                                       |
