# Supabase setup for TripNest

This guide creates a **separate** Supabase project for TripNest and loads the database.
It does not touch your existing `amazon-product-listing` project.

> **Keep secrets private.** Never paste your database password, secret key (`sb_secret_…`) or access token
> into chat, GitHub, screenshots or any public place. They go only into Supabase's own prompts, your terminal,
> or your local `.env.local` file (which Git ignores).

## Current status (4 November 2026)

| Item               | Value                                                                                                                         |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Project            | `tripnest` (ref `cdpwcerbfsqibggnoazd`) in organization **Rojan Projects**                                                    |
| Region / plan      | `ap-south-1` South Asia (Mumbai) · Free                                                                                       |
| Project URL        | `https://cdpwcerbfsqibggnoazd.supabase.co`                                                                                    |
| Migrations applied | `initial_schema`, `functions_and_triggers`, `rls_policies_and_grants`, `search_hotels`, `booking_functions`, `cancel_booking` |
| Sample data        | Loaded and checksum-verified against `supabase/seed.sql`                                                                      |
| `npm run db:check` | All 9 checks pass                                                                                                             |
| Security Advisor   | No issues                                                                                                                     |

Steps 1–4 below are already done (with the 4 migrations; Option A applies them all); they stay here so the setup can be repeated (for example on a new
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

### How auth emails work (important for testing)

- Sign-up confirmation and password-reset emails use Supabase's default templates (Free projects created after
  3 June 2026 can't edit templates on the built-in email service).
- **Open each link in the same browser where you started** (sign-up or "Forgot password"). The link carries a
  one-time code that only works with a security cookie stored in that browser, and only once, within ~5 minutes.
- **Built-in email service limits:** at most **2 emails per hour**, and only to your organization's team members.

## Step 6 — Custom SMTP (optional: removes the 2-emails-per-hour limit)

With your own email provider Supabase allows 30 emails/hour by default (adjustable under
**Authentication → Rate Limits**) and can send to any address.

**Gmail (free, good for development):**

1. Turn on 2-Step Verification for your Google account, then create an **app password** at
   <https://myaccount.google.com/apppasswords> (name it "TripNest Supabase"). Keep it secret.
2. Dashboard → **tripnest** → **Authentication → Emails → SMTP Settings** → enable **Custom SMTP**:

   | Field        | Value                        |
   | ------------ | ---------------------------- |
   | Sender email | your Gmail address           |
   | Sender name  | TripNest                     |
   | Host         | `smtp.gmail.com`             |
   | Port         | `465`                        |
   | Username     | your Gmail address           |
   | Password     | the app password from step 1 |

3. Optional: **Authentication → Rate Limits** → raise _Rate limit for sending emails_ (e.g. 30–60/hour).

For the live site (Phase 11) a provider with your own domain (e.g. Resend) is more professional.

## Security notes on the database functions

Supabase's Security Advisor lists two "SECURITY DEFINER function executable" warnings. They are intentional:

- `create_booking` is the only way to create a booking (users have no INSERT permission on `bookings`). It requires a
  signed-in user, only acts for `auth.uid()`, and is not executable by `anon`.
- `cancel_booking` lets an owner cancel only their own future booking (users cannot update bookings directly).
- `get_room_availability` returns only free-room counts (no booking details) so visitors can see availability.

## Admin functions (Phase 9)

Run `supabase/migrations/20261104101500_admin_functions.sql` once on the **tripnest** project: Dashboard →
**SQL Editor → New query**, paste the whole file, **Run**. (Check the project name at the top-left first.) It adds
`admin_dashboard_stats`, `admin_save_hotel`, `admin_set_booking_status` and `admin_set_user_role`. Each one checks
`private.is_admin()` itself, so a non-admin is refused by the database. Running it in the SQL Editor does not add a row
to the CLI's migration history; that is fine for this project.

## Making yourself an admin (after you register)

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
