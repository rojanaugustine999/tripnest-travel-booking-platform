-- =====================================================================================
-- TripNest — self-check for the payments migration (run it AFTER 20261105100000_razorpay_payments.sql).
--
-- Paste into Supabase SQL Editor and Run. It makes test bookings and a test payment inside ONE transaction and
-- then deliberately ends with an error that shows the results, so EVERYTHING is rolled back: no data is kept
-- and the real payment secret is not touched.
--
-- Expected message (RESULT: ...):
--   payments_off_status=confirmed; payments_on_status=pending; bad_sig=invalid_payment; bad_amount=invalid_payment;
--   bad_binding=invalid_payment; good={"ok": true, ... "status": "confirmed", "already": false};
--   repeat={... "already": true}; payment_rows=1; reuse_order=invalid_payment;
--   stale_but_free={"ok": true, ... "status": "confirmed" ...}; expired_count=1 ref2_status=cancelled;
-- Any text containing ACCEPTED means a protection failed.
-- =====================================================================================
do $t$
declare
  v_uid uuid; v_room uuid; r jsonb; ref text; ref2 text; ref3 text; paise bigint; log text := '';
  ord text := 'order_TEST000001'; pay text := 'pay_TEST0000001'; bind text; sig text;
  d1 date := current_date + 400;
  g jsonb := '[{"full_name":"Test User","email":"t@example.com"}]'::jsonb;
  n integer;
  had_secret boolean := private.payments_enabled();
begin
  select id into v_uid from public.profiles where role = 'admin' limit 1;
  perform set_config('request.jwt.claim.sub', v_uid::text, true);
  select ro.id into v_room
    from public.rooms ro join public.hotels h on h.id = ro.hotel_id
   where ro.is_active and h.is_published and h.archived_at is null and ro.max_guests >= 2 and ro.total_units >= 2
   limit 1;

  -- Use a throw-away secret for this test only (rolled back at the end).
  delete from private.payment_settings where name = 'razorpay_key_secret';
  r := public.create_booking(v_room, d1, d1 + 2, 2, 1, g, '', gen_random_uuid());
  log := log || 'payments_off_status=' || (r ->> 'status') || '; ';

  insert into private.payment_settings values ('razorpay_key_secret', 'testsecret');
  r := public.create_booking(v_room, d1 + 10, d1 + 12, 2, 1, g, '', gen_random_uuid());
  ref := r ->> 'reference';
  log := log || 'payments_on_status=' || (r ->> 'status') || '; ';
  select round(total_amount * 100)::bigint into paise from public.bookings where reference = ref;
  bind := encode(extensions.hmac('bind|' || ord || '|' || ref || '|' || paise, 'testsecret', 'sha256'), 'hex');
  sig := encode(extensions.hmac(ord || '|' || pay, 'testsecret', 'sha256'), 'hex');

  begin perform public.confirm_booking_payment(ref, ord, pay, 'badsignature00', paise, bind); log := log || 'BAD_SIG_ACCEPTED; ';
  exception when others then log := log || 'bad_sig=' || sqlerrm || '; '; end;
  begin perform public.confirm_booking_payment(ref, ord, pay, sig, paise - 100, bind); log := log || 'BAD_AMOUNT_ACCEPTED; ';
  exception when others then log := log || 'bad_amount=' || sqlerrm || '; '; end;
  begin perform public.confirm_booking_payment(ref, ord, pay, sig, paise, 'badbindingtoken'); log := log || 'BAD_BINDING_ACCEPTED; ';
  exception when others then log := log || 'bad_binding=' || sqlerrm || '; '; end;

  r := public.confirm_booking_payment(ref, ord, pay, sig, paise, bind);
  log := log || 'good=' || r::text || '; ';
  r := public.confirm_booking_payment(ref, ord, pay, sig, paise, bind);
  log := log || 'repeat=' || r::text || '; ';
  select count(*) into n from public.payments where booking_id = (select id from public.bookings where reference = ref);
  log := log || 'payment_rows=' || n || '; ';

  -- A paid order cannot be moved to a different booking.
  r := public.create_booking(v_room, d1 + 20, d1 + 22, 2, 1, g, '', gen_random_uuid());
  ref2 := r ->> 'reference';
  select round(total_amount * 100)::bigint into paise from public.bookings where reference = ref2;
  begin perform public.confirm_booking_payment(ref2, ord, pay, sig, paise, bind); log := log || 'REUSE_ACCEPTED; ';
  exception when others then log := log || 'reuse_order=' || sqlerrm || '; '; end;

  -- A booking older than 15 minutes is still confirmed if its rooms are free.
  r := public.create_booking(v_room, d1 + 30, d1 + 32, 2, 1, g, '', gen_random_uuid());
  ref3 := r ->> 'reference';
  select round(total_amount * 100)::bigint into paise from public.bookings where reference = ref3;
  update public.bookings set created_at = now() - interval '20 minutes' where reference = ref3;
  bind := encode(extensions.hmac('bind|order_TEST000003|' || ref3 || '|' || paise, 'testsecret', 'sha256'), 'hex');
  sig := encode(extensions.hmac('order_TEST000003|pay_TEST0000003', 'testsecret', 'sha256'), 'hex');
  r := public.confirm_booking_payment(ref3, 'order_TEST000003', 'pay_TEST0000003', sig, paise, bind);
  log := log || 'stale_but_free=' || r::text || '; ';

  -- Unpaid bookings older than 15 minutes are cancelled.
  update public.bookings set created_at = now() - interval '20 minutes' where reference = ref2;
  n := public.expire_pending_bookings();
  log := log || 'expired_count=' || n || ' ref2_status=' || (select status::text from public.bookings where reference = ref2) || '; ';

  raise exception 'RESULT: % (secret_was_set_before=%)', log, had_secret;
end
$t$;
