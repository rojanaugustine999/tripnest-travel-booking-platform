-- =====================================================================================
-- TripNest — administrator functions (Phase 9)
--
-- Every function checks private.is_admin() itself, so a non-admin is rejected here in the DATABASE,
-- whatever the website code does. Admins' normal table permissions (RLS) are unchanged.
-- =====================================================================================

-- ---- Dashboard statistics (SECURITY INVOKER: runs with the admin's own permissions) --------
create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not private.is_admin() then
    raise exception 'not_admin' using errcode = 'P0001';
  end if;

  select jsonb_build_object(
    'hotels', (select count(*) from public.hotels where archived_at is null),
    'published_hotels', (select count(*) from public.hotels where archived_at is null and is_published),
    'rooms', (select count(*) from public.rooms where is_active),
    'bookings', (select count(*) from public.bookings),
    'users', (select count(*) from public.profiles),
    -- Demo revenue: totals of confirmed and completed demo bookings. No real money is involved.
    'demo_revenue', coalesce((select sum(total_amount) from public.bookings where status in ('confirmed', 'completed')), 0),
    'by_status', coalesce((
      select jsonb_agg(jsonb_build_object('status', status, 'count', n) order by status)
      from (select status, count(*) as n from public.bookings group by status) s
    ), '[]'::jsonb),
    'per_day', (
      select jsonb_agg(jsonb_build_object('day', to_char(d.day, 'YYYY-MM-DD'), 'count', coalesce(b.n, 0)) order by d.day)
      from generate_series(current_date - 13, current_date, interval '1 day') as d(day)
      left join (
        select created_at::date as day, count(*) as n from public.bookings group by 1
      ) b on b.day = d.day::date
    ),
    'recent', coalesce((
      select jsonb_agg(row_to_json(r)) from (
        select b.reference, b.status, b.total_amount, b.created_at, b.check_in, b.check_out,
               h.name as hotel, p.email as guest_email
        from public.bookings b
        left join public.hotels h on h.id = b.hotel_id
        left join public.profiles p on p.id = b.user_id
        order by b.created_at desc limit 6
      ) r
    ), '[]'::jsonb),
    'popular', coalesce((
      select jsonb_agg(row_to_json(r)) from (
        select h.name, h.slug, count(b.id) filter (where b.status <> 'cancelled') as bookings
        from public.hotels h
        left join public.bookings b on b.hotel_id = h.id
        group by h.id
        order by 3 desc, h.popularity desc limit 5
      ) r
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.admin_dashboard_stats() from public, anon;
grant execute on function public.admin_dashboard_stats() to authenticated, service_role;

-- ---- Create or update a hotel with its images and amenities in ONE transaction -------------
-- SECURITY INVOKER: the table policies (admins only) still apply underneath.
create or replace function public.admin_save_hotel(p_hotel jsonb)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_id uuid := nullif(p_hotel ->> 'id', '')::uuid;
  v_offer_label text := nullif(btrim(coalesce(p_hotel ->> 'offer_label', '')), '');
  v_offer_percent smallint := nullif(p_hotel ->> 'offer_discount_percent', '')::smallint;
  v_image jsonb;
  v_amenity text;
  v_position integer;
begin
  if not private.is_admin() then
    raise exception 'not_admin' using errcode = 'P0001';
  end if;

  if (v_offer_label is null) <> (v_offer_percent is null) then
    raise exception 'invalid_offer' using errcode = 'P0001';
  end if;
  if jsonb_typeof(p_hotel -> 'images') <> 'array' or jsonb_array_length(p_hotel -> 'images') not between 1 and 12 then
    raise exception 'invalid_images' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.destinations where id = (p_hotel ->> 'destination_id')::uuid) then
    raise exception 'destination_not_found' using errcode = 'P0001';
  end if;

  begin
    if v_id is null then
      insert into public.hotels (
        slug, destination_id, name, city, address, accommodation_type, star_rating, short_description,
        description, facilities, check_in_time, check_out_time, cancellation_policy,
        is_featured, is_published, offer_label, offer_discount_percent
      ) values (
        p_hotel ->> 'slug', (p_hotel ->> 'destination_id')::uuid, btrim(p_hotel ->> 'name'), btrim(p_hotel ->> 'city'),
        btrim(p_hotel ->> 'address'), (p_hotel ->> 'accommodation_type')::public.accommodation_type,
        (p_hotel ->> 'star_rating')::smallint, btrim(p_hotel ->> 'short_description'), btrim(p_hotel ->> 'description'),
        coalesce(array(select jsonb_array_elements_text(coalesce(p_hotel -> 'facilities', '[]'::jsonb))), '{}'),
        (p_hotel ->> 'check_in_time')::time, (p_hotel ->> 'check_out_time')::time, btrim(p_hotel ->> 'cancellation_policy'),
        coalesce((p_hotel ->> 'is_featured')::boolean, false), coalesce((p_hotel ->> 'is_published')::boolean, false),
        v_offer_label, v_offer_percent
      ) returning id into v_id;
    else
      update public.hotels set
        slug = p_hotel ->> 'slug',
        destination_id = (p_hotel ->> 'destination_id')::uuid,
        name = btrim(p_hotel ->> 'name'),
        city = btrim(p_hotel ->> 'city'),
        address = btrim(p_hotel ->> 'address'),
        accommodation_type = (p_hotel ->> 'accommodation_type')::public.accommodation_type,
        star_rating = (p_hotel ->> 'star_rating')::smallint,
        short_description = btrim(p_hotel ->> 'short_description'),
        description = btrim(p_hotel ->> 'description'),
        facilities = coalesce(array(select jsonb_array_elements_text(coalesce(p_hotel -> 'facilities', '[]'::jsonb))), '{}'),
        check_in_time = (p_hotel ->> 'check_in_time')::time,
        check_out_time = (p_hotel ->> 'check_out_time')::time,
        cancellation_policy = btrim(p_hotel ->> 'cancellation_policy'),
        is_featured = coalesce((p_hotel ->> 'is_featured')::boolean, false),
        is_published = coalesce((p_hotel ->> 'is_published')::boolean, false),
        offer_label = v_offer_label,
        offer_discount_percent = v_offer_percent
      where id = v_id;
      if not found then
        raise exception 'hotel_not_found' using errcode = 'P0001';
      end if;
    end if;
  exception when unique_violation then
    raise exception 'slug_taken' using errcode = 'P0001';
  end;

  -- Replace the gallery and the amenity list (order matters: first image is the cover).
  delete from public.hotel_images where hotel_id = v_id;
  v_position := 0;
  for v_image in select * from jsonb_array_elements(p_hotel -> 'images') loop
    insert into public.hotel_images (hotel_id, url, alt, position)
    values (v_id, btrim(v_image ->> 'url'), btrim(v_image ->> 'alt'), v_position);
    v_position := v_position + 1;
  end loop;

  delete from public.hotel_amenities where hotel_id = v_id;
  v_position := 0;
  for v_amenity in select * from jsonb_array_elements_text(coalesce(p_hotel -> 'amenity_ids', '[]'::jsonb)) loop
    insert into public.hotel_amenities (hotel_id, amenity_id, position)
    values (v_id, v_amenity::uuid, v_position)
    on conflict do nothing;
    v_position := v_position + 1;
  end loop;

  return v_id;
end;
$$;

revoke all on function public.admin_save_hotel(jsonb) from public, anon;
grant execute on function public.admin_save_hotel(jsonb) to authenticated, service_role;

-- ---- Booking status changes with permitted transitions only -------------------------------
--   pending   -> confirmed | cancelled
--   confirmed -> completed (only once the stay has started) | cancelled
--   completed / cancelled are final.
create or replace function public.admin_set_booking_status(p_reference text, p_status public.booking_status)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_booking public.bookings;
begin
  if not private.is_admin() then
    raise exception 'not_admin' using errcode = 'P0001';
  end if;

  select * into v_booking from public.bookings where reference = upper(btrim(p_reference)) for update;
  if not found then
    raise exception 'booking_not_found' using errcode = 'P0001';
  end if;

  if not (
    (v_booking.status = 'pending' and p_status in ('confirmed', 'cancelled'))
    or (v_booking.status = 'confirmed' and p_status = 'cancelled')
    or (v_booking.status = 'confirmed' and p_status = 'completed' and v_booking.check_in <= current_date)
  ) then
    raise exception 'invalid_transition' using errcode = 'P0001';
  end if;

  update public.bookings
  set status = p_status,
      cancelled_at = case when p_status = 'cancelled' then now() else cancelled_at end
  where id = v_booking.id;

  return jsonb_build_object('reference', v_booking.reference, 'status', p_status);
end;
$$;

revoke all on function public.admin_set_booking_status(text, public.booking_status) from public, anon;
grant execute on function public.admin_set_booking_status(text, public.booking_status) to authenticated, service_role;

-- ---- Change a user's role (admins only; never your own) -----------------------------------
create or replace function public.admin_set_user_role(p_user_id uuid, p_role public.user_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'not_admin' using errcode = 'P0001';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'cannot_change_own_role' using errcode = 'P0001';
  end if;

  update public.profiles set role = p_role where id = p_user_id;
  if not found then
    raise exception 'user_not_found' using errcode = 'P0001';
  end if;
end;
$$;

revoke all on function public.admin_set_user_role(uuid, public.user_role) from public, anon;
grant execute on function public.admin_set_user_role(uuid, public.user_role) to authenticated, service_role;
