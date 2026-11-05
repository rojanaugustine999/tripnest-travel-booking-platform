-- =====================================================================================
-- TripNest — Razorpay TEST-MODE payments (Phase 12)
--
-- How it stays safe:
--  * Payments are OFF until you store a Razorpay key secret (see docs/PAYMENTS.md). Until then
--    create_booking behaves exactly as before (instant demo confirmation).
--  * When ON, a new booking starts as 'pending' and holds its rooms for 15 minutes.
--  * A booking becomes 'confirmed' ONLY through confirm_booking_payment(), which checks two
--    HMAC-SHA256 signatures in the database itself (Razorpay's payment signature, and a binding
--    token our server issued when it created the order). Without the secret nobody can forge them,
--    so a signed-in user cannot confirm a booking by calling the function directly.
--  * Only Razorpay TEST keys are accepted by the app (rzp_test_...). No real money is ever moved.
-- =====================================================================================

-- ---- Secret storage (private schema is not exposed through the API) -------------------
create table if not exists private.payment_settings (
  name text primary key,
  value text not null
);
revoke all on private.payment_settings from public, anon, authenticated;

create or replace function private.payments_enabled()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from private.payment_settings where name = 'razorpay_key_secret' and btrim(value) <> ''
  );
$$;
revoke all on function private.payments_enabled() from public, anon;

create or replace function private.razorpay_secret()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare v_secret text;
begin
  select value into v_secret from private.payment_settings where name = 'razorpay_key_secret';
  if v_secret is null or btrim(v_secret) = '' then
    raise exception 'payments_not_configured' using errcode = 'P0001';
  end if;
  return v_secret;
end;
$$;
revoke all on function private.razorpay_secret() from public, anon;

create or replace function private.pending_hold()
returns interval
language sql
immutable
set search_path = ''
as $$ select interval '15 minutes'; $$;

-- ---- Payments table ----------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete restrict,
  user_id uuid not null references public.profiles (id) on delete restrict,
  provider text not null default 'razorpay' check (provider = 'razorpay'),
  order_id text not null unique check (char_length(order_id) between 5 and 100),
  payment_id text not null unique check (char_length(payment_id) between 5 and 100),
  amount_paise bigint not null check (amount_paise > 0),
  currency char(3) not null default 'INR',
  is_test boolean not null default true,
  paid_at timestamptz not null default now()
);
create index payments_booking_id_idx on public.payments (booking_id);
create index payments_user_id_idx on public.payments (user_id);

alter table public.payments enable row level security;
revoke all on public.payments from public, anon, authenticated;
grant select on public.payments to authenticated;

create policy "Users can view their own payments"
  on public.payments for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Admins can view all payments"
  on public.payments for select to authenticated
  using (private.is_admin());

-- ---- Availability: a pending booking only holds rooms for 15 minutes ----------------------
create or replace function private.room_units_free(p_room_id uuid, p_check_in date, p_check_out date)
returns integer
language sql
stable
set search_path = ''
as $$
  select greatest(
    0,
    r.total_units - r.blocked_units - coalesce((
      select max(night_rooms)
      from (
        select sum(b.room_count) as night_rooms
        from generate_series(p_check_in, p_check_out - 1, interval '1 day') as night
        join public.bookings b
          on b.room_id = r.id
         and (
           b.status = 'confirmed'
           or (b.status = 'pending' and b.created_at > now() - private.pending_hold())
         )
         and b.check_in <= night::date
         and b.check_out > night::date
        group by night
      ) per_night
    ), 0)
  )::integer
  from public.rooms r
  where r.id = p_room_id;
$$;
revoke all on function private.room_units_free(uuid, date, date) from public;

-- ---- Expire stale pending bookings (called from pages and from create_booking) ------------
create or replace function public.expire_pending_bookings()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare v_count integer;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in' using errcode = 'P0001';
  end if;
  update public.bookings
     set status = 'cancelled', cancelled_at = now()
   where status = 'pending' and created_at <= now() - private.pending_hold();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
revoke all on function public.expire_pending_bookings() from public, anon;
grant execute on function public.expire_pending_bookings() to authenticated, service_role;

-- ---- create_booking (now returns the status; starts as pending when payments are ON) ----
create or replace function public.create_booking(
  p_room_id uuid,
  p_check_in date,
  p_check_out date,
  p_guest_count integer,
  p_room_count integer,
  p_guests jsonb,
  p_special_requests text,
  p_idempotency_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  c_tax_rate constant numeric := 0.12; -- demo GST
  v_user uuid := auth.uid();
  v_room public.rooms;
  v_hotel public.hotels;
  v_existing public.bookings;
  v_nights integer;
  v_nightly numeric(10, 2);
  v_subtotal numeric(12, 2);
  v_taxes numeric(12, 2);
  v_booking public.bookings;
  v_guest jsonb;
  v_index integer := 0;
  v_attempt integer := 0;
  v_status public.booking_status;
begin
  if v_user is null then
    raise exception 'not_signed_in' using errcode = 'P0001';
  end if;

  -- Release rooms held by unpaid bookings, then decide whether this booking needs a payment.
  update public.bookings set status = 'cancelled', cancelled_at = now()
   where status = 'pending' and created_at <= now() - private.pending_hold();
  v_status := case when private.payments_enabled() then 'pending' else 'confirmed' end;
  if p_idempotency_key is null or p_room_id is null or p_check_in is null or p_check_out is null then
    raise exception 'invalid_request' using errcode = 'P0001';
  end if;

  -- Same submission sent twice (double click, retry): return the booking that already exists.
  select * into v_existing from public.bookings where user_id = v_user and idempotency_key = p_idempotency_key;
  if found then
    return jsonb_build_object('id', v_existing.id, 'reference', v_existing.reference, 'status', v_existing.status, 'duplicate', true);
  end if;

  -- Dates
  if p_check_in < current_date then
    raise exception 'dates_in_past' using errcode = 'P0001';
  end if;
  if p_check_out <= p_check_in then
    raise exception 'dates_reversed' using errcode = 'P0001';
  end if;
  v_nights := p_check_out - p_check_in;
  if v_nights > 30 then
    raise exception 'stay_too_long' using errcode = 'P0001';
  end if;

  -- Party size
  if p_room_count is null or p_room_count not between 1 and 8
     or p_guest_count is null or p_guest_count not between 1 and 16
     or p_guest_count < p_room_count then
    raise exception 'invalid_party' using errcode = 'P0001';
  end if;

  -- Guest list: 1..16 entries, the first is the main guest and needs a name and email.
  if p_guests is null or jsonb_typeof(p_guests) <> 'array'
     or jsonb_array_length(p_guests) not between 1 and 16
     or char_length(btrim(coalesce(p_guests -> 0 ->> 'full_name', ''))) not between 2 and 100
     or coalesce(p_guests -> 0 ->> 'email', '') !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_guests' using errcode = 'P0001';
  end if;
  if p_special_requests is not null and char_length(p_special_requests) > 1000 then
    raise exception 'invalid_guests' using errcode = 'P0001';
  end if;

  -- Lock this room type until the transaction ends: concurrent bookings for it queue up here,
  -- so the availability check below cannot be raced.
  select * into v_room from public.rooms where id = p_room_id and is_active for update;
  if not found then
    raise exception 'room_not_found' using errcode = 'P0001';
  end if;
  select * into v_hotel from public.hotels where id = v_room.hotel_id and is_published and archived_at is null;
  if not found then
    raise exception 'room_not_found' using errcode = 'P0001';
  end if;

  if v_room.max_guests < ceil(p_guest_count::numeric / p_room_count) then
    raise exception 'too_many_guests' using errcode = 'P0001';
  end if;

  if private.room_units_free(v_room.id, p_check_in, p_check_out) < p_room_count then
    raise exception 'sold_out' using errcode = 'P0001';
  end if;

  -- Price, always calculated here from the database (never from the browser).
  v_nightly := round(v_room.price_per_night * (1 - coalesce(v_hotel.offer_discount_percent, 0) / 100.0));
  v_subtotal := v_nightly * v_nights * p_room_count;
  v_taxes := round(v_subtotal * c_tax_rate, 2);

  loop
    v_attempt := v_attempt + 1;
    begin
      insert into public.bookings (
        reference, user_id, hotel_id, room_id, check_in, check_out, guest_count, room_count,
        original_nightly_price, nightly_price, subtotal, taxes, fees, total_amount,
        status, is_demo, idempotency_key, special_requests
      ) values (
        'TN-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8)),
        v_user, v_hotel.id, v_room.id, p_check_in, p_check_out, p_guest_count, p_room_count,
        v_room.price_per_night, v_nightly, v_subtotal, v_taxes, 0, v_subtotal + v_taxes,
        v_status, true, p_idempotency_key, nullif(btrim(coalesce(p_special_requests, '')), '')
      )
      returning * into v_booking;
      exit;
    exception when unique_violation then
      -- Another submission with the same key won the race: return it. Otherwise the reference collided: retry.
      select * into v_existing from public.bookings where user_id = v_user and idempotency_key = p_idempotency_key;
      if found then
        return jsonb_build_object('id', v_existing.id, 'reference', v_existing.reference, 'status', v_existing.status, 'duplicate', true);
      end if;
      if v_attempt >= 5 then raise; end if;
    end;
  end loop;

  for v_guest in select * from jsonb_array_elements(p_guests) loop
    insert into public.booking_guests (booking_id, full_name, email, phone, is_primary)
    values (
      v_booking.id,
      btrim(v_guest ->> 'full_name'),
      nullif(btrim(coalesce(v_guest ->> 'email', '')), ''),
      nullif(btrim(coalesce(v_guest ->> 'phone', '')), ''),
      v_index = 0
    );
    v_index := v_index + 1;
  end loop;

  return jsonb_build_object('id', v_booking.id, 'reference', v_booking.reference, 'status', v_booking.status, 'duplicate', false);
end;
$$;

revoke all on function public.create_booking(uuid, date, date, integer, integer, jsonb, text, uuid) from public, anon;
grant execute on function public.create_booking(uuid, date, date, integer, integer, jsonb, text, uuid) to authenticated, service_role;

-- ---- confirm_booking_payment -------------------------------------------------------------
-- Called by the server after Razorpay's checkout succeeds. Verifies both signatures here, records
-- the payment, and confirms the booking. Returns {ok:false, error:...} (not an exception) when the
-- payment is valid but the booking could not be kept, so the payment record is still saved.
create or replace function public.confirm_booking_payment(
  p_reference text,
  p_order_id text,
  p_payment_id text,
  p_signature text,
  p_amount_paise bigint,
  p_binding text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_secret text;
  v_booking public.bookings;
  v_expected bigint;
begin
  if v_user is null then
    raise exception 'not_signed_in' using errcode = 'P0001';
  end if;
  v_secret := private.razorpay_secret();

  if p_reference is null or p_order_id is null or p_payment_id is null
     or p_signature is null or p_amount_paise is null or p_binding is null
     or char_length(p_order_id) not between 5 and 100
     or char_length(p_payment_id) not between 5 and 100 then
    raise exception 'invalid_payment' using errcode = 'P0001';
  end if;

  -- Lock the booking (only the caller's own).
  select * into v_booking
  from public.bookings
  where reference = upper(btrim(p_reference)) and user_id = v_user
  for update;
  if not found then
    raise exception 'booking_not_found' using errcode = 'P0001';
  end if;

  -- The same payment sent twice: nothing more to do.
  if exists (select 1 from public.payments where booking_id = v_booking.id and payment_id = p_payment_id) then
    return jsonb_build_object('ok', true, 'reference', v_booking.reference, 'status', v_booking.status, 'already', true);
  end if;

  -- The amount must be the booking's total, and both signatures must match.
  v_expected := round(v_booking.total_amount * 100)::bigint;
  if p_amount_paise <> v_expected then
    raise exception 'invalid_payment' using errcode = 'P0001';
  end if;
  if encode(extensions.hmac('bind|' || p_order_id || '|' || v_booking.reference || '|' || p_amount_paise::text,
                            v_secret, 'sha256'), 'hex') <> lower(p_binding)
     or encode(extensions.hmac(p_order_id || '|' || p_payment_id, v_secret, 'sha256'), 'hex') <> lower(p_signature) then
    raise exception 'invalid_payment' using errcode = 'P0001';
  end if;

  -- Record the (test) payment first, so it is never lost even if the booking cannot be kept.
  begin
    insert into public.payments (booking_id, user_id, order_id, payment_id, amount_paise, is_test)
    values (v_booking.id, v_user, p_order_id, p_payment_id, v_expected, true);
  exception when unique_violation then
    raise exception 'invalid_payment' using errcode = 'P0001';
  end;

  if v_booking.status = 'confirmed' then
    return jsonb_build_object('ok', true, 'reference', v_booking.reference, 'status', 'confirmed', 'already', true);
  end if;
  if v_booking.status <> 'pending' then
    return jsonb_build_object('ok', false, 'error', 'booking_expired', 'reference', v_booking.reference);
  end if;

  -- A pending booking older than 15 minutes no longer holds its rooms: re-check under the room lock.
  perform 1 from public.rooms where id = v_booking.room_id for update;
  if v_booking.created_at <= now() - private.pending_hold()
     and private.room_units_free(v_booking.room_id, v_booking.check_in, v_booking.check_out) < v_booking.room_count then
    update public.bookings set status = 'cancelled', cancelled_at = now() where id = v_booking.id;
    return jsonb_build_object('ok', false, 'error', 'booking_expired', 'reference', v_booking.reference);
  end if;

  update public.bookings set status = 'confirmed' where id = v_booking.id;
  return jsonb_build_object('ok', true, 'reference', v_booking.reference, 'status', 'confirmed', 'already', false);
end;
$$;

revoke all on function public.confirm_booking_payment(text, text, text, text, bigint, text) from public, anon;
grant execute on function public.confirm_booking_payment(text, text, text, text, bigint, text) to authenticated, service_role;
