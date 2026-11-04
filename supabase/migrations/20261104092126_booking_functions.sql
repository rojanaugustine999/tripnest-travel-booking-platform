-- =====================================================================================
-- TripNest — demo booking functions (Phase 7)
--
-- create_booking: the ONLY way a booking is created. It re-checks everything on the server:
-- dates, guest limits, availability for every night (with a row lock, so two people cannot take the
-- last room at the same moment), and recalculates the price. Prices sent by the browser are never used.
--
-- SECURITY DEFINER because signed-in users have no INSERT permission on bookings (that is what stops
-- price tampering). It is safe because it (1) requires a signed-in user, (2) only ever acts for
-- auth.uid(), (3) is not executable by anon/PUBLIC, and (4) uses an empty search_path.
-- =====================================================================================

-- ---- Room availability for a date range ------------------------------------------------
-- Units free for EVERY night in [check_in, check_out): total - blocked - the busiest night's booked rooms.
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
         and b.status in ('pending', 'confirmed')
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

-- ---- Public read-only availability (counts only; no booking details are revealed) ---------
create or replace function public.get_room_availability(p_hotel_id uuid, p_check_in date, p_check_out date)
returns table (room_id uuid, units_free integer)
language sql
stable
security definer
set search_path = ''
as $$
  select r.id, private.room_units_free(r.id, p_check_in, p_check_out)
  from public.rooms r
  join public.hotels h on h.id = r.hotel_id
  where r.hotel_id = p_hotel_id
    and r.is_active
    and h.is_published
    and h.archived_at is null
    and p_check_in is not null
    and p_check_out > p_check_in
    and p_check_out - p_check_in <= 30;
$$;

revoke all on function public.get_room_availability(uuid, date, date) from public;
grant execute on function public.get_room_availability(uuid, date, date) to anon, authenticated, service_role;

-- ---- create_booking ----------------------------------------------------------------------
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
begin
  if v_user is null then
    raise exception 'not_signed_in' using errcode = 'P0001';
  end if;
  if p_idempotency_key is null or p_room_id is null or p_check_in is null or p_check_out is null then
    raise exception 'invalid_request' using errcode = 'P0001';
  end if;

  -- Same submission sent twice (double click, retry): return the booking that already exists.
  select * into v_existing from public.bookings where user_id = v_user and idempotency_key = p_idempotency_key;
  if found then
    return jsonb_build_object('id', v_existing.id, 'reference', v_existing.reference, 'duplicate', true);
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
        'confirmed', true, p_idempotency_key, nullif(btrim(coalesce(p_special_requests, '')), '')
      )
      returning * into v_booking;
      exit;
    exception when unique_violation then
      -- Another submission with the same key won the race: return it. Otherwise the reference collided: retry.
      select * into v_existing from public.bookings where user_id = v_user and idempotency_key = p_idempotency_key;
      if found then
        return jsonb_build_object('id', v_existing.id, 'reference', v_existing.reference, 'duplicate', true);
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

  return jsonb_build_object('id', v_booking.id, 'reference', v_booking.reference, 'duplicate', false);
end;
$$;

revoke all on function public.create_booking(uuid, date, date, integer, integer, jsonb, text, uuid) from public, anon;
grant execute on function public.create_booking(uuid, date, date, integer, integer, jsonb, text, uuid) to authenticated, service_role;
