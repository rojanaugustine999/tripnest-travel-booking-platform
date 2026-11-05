# Razorpay test-mode payments (Phase 12)

TripNest can ask the guest to pay for a booking with **Razorpay in TEST mode**. It is for demonstration only.
**No real money is ever moved.** The app accepts only test keys (`rzp_test_…`); if a live key (`rzp_live_…`) is put in
by mistake, payments stay switched off.

Payments are **off by default**. Until you finish the setup below, bookings are confirmed instantly, exactly as before.

> **Keep secrets private.** The Razorpay **Key Secret** goes only into `.env.local`, Vercel's environment variables and
> the Supabase SQL Editor (step 4). Never paste it into chat, GitHub, screenshots or code.

## How it works

1. The guest confirms the booking form. The database creates the booking as **pending** and holds the room for
   **15 minutes**. The price is calculated by the database, never by the browser.
2. The server creates a Razorpay **order** for that exact total and signs it with a **binding token**
   (`HMAC-SHA256("bind|order|reference|amount")`) so the order can belong to one booking and one amount only.
3. Razorpay's payment window opens. The guest pays with a test card or test UPI.
4. Razorpay returns a payment id and a **signature**. The server passes them to the database function
   `confirm_booking_payment`, which re-checks the booking owner, the amount and **both signatures itself**
   (using the secret stored in a private table). Only then is the booking **confirmed** and the payment recorded.
5. If the guest closes the window, the booking stays pending with a **Pay now** button for 15 minutes, then it
   is cancelled and the room is released (done lazily when bookings are opened or a new booking is made).

Why the database verifies the signatures: the `confirm_booking_payment` function is callable by signed-in users. If it
trusted the server blindly, anyone could call it directly with made-up values. Because it checks HMAC signatures made
with a secret nobody else has, a forged call fails.

## Setup (about 15 minutes)

### 1. Get Razorpay test keys

1. Create or sign in to a free account at <https://razorpay.com>.
2. Switch the dashboard to **Test Mode** (toggle at the top).
3. **Account & Settings → API Keys → Generate Test Key.** Note the **Key Id** (`rzp_test_…`) and **Key Secret**.
   The secret is shown only once; save it in your password manager.

### 2. Run the migration

Supabase Dashboard → **tripnest** → **SQL Editor → New query**, paste the whole file
`supabase/migrations/20261105100000_razorpay_payments.sql` and **Run**. It ends with "Success". This adds the
`payments` table and the payment functions. It changes nothing for guests until step 4.

### 3. Add the keys to the app

- Local: put these in `.env.local` (never commit it):

  ```
  RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
  RAZORPAY_KEY_SECRET=your_test_key_secret
  ```

- Live site: Vercel → project → **Settings → Environment Variables** → add the same two names for **Production**,
  then **Redeploy** (a changed variable does not affect an existing deployment).

### 4. Give the database the same secret (this switches payments ON)

In the Supabase SQL Editor run this once, replacing the placeholder with your **test** Key Secret:

```sql
insert into private.payment_settings (name, value)
values ('razorpay_key_secret', 'PASTE_YOUR_TEST_KEY_SECRET_HERE')
on conflict (name) do update set value = excluded.value;
```

To switch payments **off** again: `delete from private.payment_settings where name = 'razorpay_key_secret';`
(bookings then confirm instantly). The `private` schema is not exposed through the API, so the secret cannot be read
from the browser.

### 5. Try it

Book a room, then in Razorpay's window use:

| Method         | Details                                                    |
| -------------- | ---------------------------------------------------------- |
| Card (success) | `4111 1111 1111 1111`, any future expiry, any CVV, any OTP |
| UPI (success)  | `success@razorpay`                                         |
| UPI (failure)  | `failure@razorpay`                                         |

The booking becomes **Confirmed** and a "Paid in Razorpay test mode" line appears on the confirmation page, the
booking details page and the admin booking page. Test payments also show in Razorpay's dashboard (Test Mode).

## Test checklist

- [ ] Pay with the test card: booking confirmed, receipt shown.
- [ ] Close the payment window: booking stays **Pending**, **Pay now** works, the room is held.
- [ ] Choose a failing UPI id: an error appears and the booking stays pending.
- [ ] Wait 15 minutes without paying: the booking becomes **Cancelled** when you next open My bookings.
- [ ] Another account cannot see or pay your booking.

## Known limitations

- **Test mode only.** Going live would need Razorpay business verification and a review of refunds, webhooks and
  receipts; that is out of scope.
- **No webhook.** Confirmation relies on the browser returning from the payment window. If the browser is closed at
  the exact moment of paying, the booking stays pending and expires (in test mode no money moved). A webhook would
  need the Supabase secret key on the server, which this project deliberately avoids.
- Cancelling a paid booking does not trigger a refund (there is no real money in test mode).
- The CSP allows Razorpay's script, payment window and API hosts (see `next.config.ts`).
