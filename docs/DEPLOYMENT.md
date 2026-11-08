# Deploying TripNest (GitHub + Vercel)

Nothing here happens automatically. You decide when to push and when to deploy.

> **Keep secrets private.** The three values below are the only configuration the app needs. Never paste your database
> password or any `sb_secret_…` key into GitHub, Vercel, screenshots or chat.

## 0. Before you start

- `npm run lint`, `npm run typecheck`, `npm run build` all pass locally.
- `git status` is clean and `.env.local` is **not** tracked (`git ls-files | grep env` shows only `.env.example`).
- Your Supabase project `tripnest` has all migrations applied and the sample data loaded (see
  [SUPABASE_SETUP.md](SUPABASE_SETUP.md)).

## 1. Put the code on GitHub

Repository name: `tripnest-travel-booking-platform` under the `rojanaugustine999` account. Your existing Amazon
repository is not touched.

**Option A — GitHub CLI (already installed and signed in on this computer):**

```bash
gh repo create rojanaugustine999/tripnest-travel-booking-platform --public --source=. --remote=origin --push
```

Use `--private` instead of `--public` if you prefer to keep it private for now.

**Option B — website:**

1. On github.com click **New repository**, name it `tripnest-travel-booking-platform`, leave "Add a README" **off**.
2. Then run:

```bash
git remote add origin https://github.com/rojanaugustine999/tripnest-travel-booking-platform.git
git branch -M main
git push -u origin main
```

## 2. Import the project into Vercel

1. Sign in at <https://vercel.com> (choose **Continue with GitHub**).
2. **Add New… → Project**, pick `tripnest-travel-booking-platform`, click **Import**.
3. Vercel detects **Next.js** automatically. Leave the build command and output directory as they are.
4. Region: under **Settings → Functions** choose **Mumbai (bom1)** — closest to the Supabase database (also Mumbai).

## 3. Environment variables

In the import screen (or **Settings → Environment Variables**) add these for **Production** (and Preview if you
want preview deployments to work):

| Name                                   | Value                                                                                             |
| -------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase → Project Settings → API → **Project URL**                                               |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys → **Publishable key** (`sb_publishable_…`)                 |
| `NEXT_PUBLIC_SITE_URL`                 | Your live address, e.g. `https://tripnest-travel-booking-platform.vercel.app` (no trailing slash) |

Optional, for test-mode payments only (see [PAYMENTS.md](PAYMENTS.md)): `RAZORPAY_KEY_ID` (`rzp_test_…`) and
`RAZORPAY_KEY_SECRET`. Never use live Razorpay keys; the app ignores them.

Do **not** add `SUPABASE_SECRET_KEY` — the app does not use it. `NEXT_PUBLIC_SITE_URL` matters: confirmation and
password-reset emails use it to build their links.

After the first deploy you will know the real URL; if you used a guess, correct the variable and **redeploy**
(Deployments → ⋯ → Redeploy). Changing a variable does not change a deployment that already exists.

## 4. Tell Supabase about the live address

Supabase → **Authentication → URL Configuration**:

- **Site URL:** your live address (for example `https://tripnest-travel-booking-platform.vercel.app`)
- **Redirect URLs:** add `https://tripnest-travel-booking-platform.vercel.app/**` and keep
  `http://localhost:3000/**` so local development still works.

Without this, sign-up and password-reset links will fail with "link invalid" or send people to the wrong address.

## 5. Deploy

Click **Deploy** (first time) or push to `main` — Vercel builds and publishes every push automatically. A build takes
about a minute.

## 6. Verify the live site

Open the live address and check:

- [ ] Home, Destinations, Hotels load with images; filtering and sorting work.
- [ ] A hotel page shows rooms; picking dates shows availability.
- [ ] Register a new account (needs a team-member email on the built-in email service — see below), confirm the
      email **in the same browser**, log in, log out.
- [ ] Book a room and open the confirmation page; the booking appears in **My bookings**.
- [ ] Save and remove a hotel with the heart button.
- [ ] `/admin` shows **404** when signed out or signed in as a normal user.
- [ ] If payments are switched on (see [PAYMENTS.md](PAYMENTS.md)): book a room, pay with the Razorpay test card and
      check the confirmation page shows **Confirmed** and a "Paid in Razorpay test mode" receipt.
- [ ] Make your account admin (SQL in [SUPABASE_SETUP.md](SUPABASE_SETUP.md)) and check the admin overview.
- [ ] Response headers contain `Content-Security-Policy` (browser dev tools → Network → any page → Headers).

From your computer you can also run `npm run db:security` against the same Supabase project.

## 7. Troubleshooting

| Symptom                                   | Likely cause and fix                                                                                                                                                      |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build fails: "Supabase is not configured" | The two `NEXT_PUBLIC_SUPABASE_*` variables are missing or empty for that environment. Add them and redeploy.                                                              |
| Build fails with a TypeScript error       | Run `npm run typecheck` locally; fix, commit and push.                                                                                                                    |
| Pages show "We couldn't load this page"   | The Supabase URL/key are wrong, or the database is paused (Free projects pause after a week of no use) — open the Supabase dashboard and restore it.                      |
| Sign-up/reset link says "link invalid"    | Redirect URL not added in Supabase (step 4), or the link was opened in a different browser, or it is older than 5 minutes.                                                |
| Links in emails point to `localhost`      | `NEXT_PUBLIC_SITE_URL` is wrong. Fix it and **redeploy**.                                                                                                                 |
| "Email limit reached"                     | Supabase's built-in email sends 2 emails/hour and only to team members. Add your own SMTP (see SUPABASE_SETUP.md step 6).                                                 |
| Images blocked / broken                   | Hotel images must be https links from `images.unsplash.com` (see `images.remotePatterns` in `next.config.ts` and the `img-src` rule in the CSP). Add other hosts to both. |
| Admin changes do not show on public pages | Hotel and destination data is cached for a short time and refreshed when an admin saves; wait a minute or re-save.                                                        |
| Login works locally but not live          | Check cookies are not blocked and that Site URL / Redirect URLs match the exact live address (no `www` mismatch).                                                         |

Vercel shows build and runtime logs under **Deployments → (your deployment) → Logs**. Supabase logs are under
**Logs** in its dashboard.

## 8. Custom domain (optional)

Vercel → **Settings → Domains → Add**, follow the DNS instructions, then update `NEXT_PUBLIC_SITE_URL` and the two
Supabase URL settings to the new address and redeploy.
