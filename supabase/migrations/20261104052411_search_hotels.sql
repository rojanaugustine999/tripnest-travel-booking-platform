-- =====================================================================================
-- TripNest — hotel search in the database (Phase 6)
--
-- Moves search, filters, sorting and pagination from the browser-side sample data into one
-- read-only SQL function, so the listing page fetches exactly one page of results.
-- =====================================================================================

-- Accent-insensitive search ("hotel" finds "Hôtel"). Supabase keeps extensions in `extensions`.
create extension if not exists unaccent with schema extensions;

-- Stable display order: the filter list uses amenities.display_order; each hotel card lists its own
-- amenities in hotel_amenities.position order (most important first). The seed fills both.
alter table public.amenities add column if not exists display_order smallint not null default 0;
alter table public.hotel_amenities add column if not exists position smallint not null default 0;

-- -------------------------------------------------------------------------------------
-- search_hotels
--
-- SECURITY INVOKER (the default): runs with the caller's permissions, so Row Level Security
-- still decides what is visible — signed-out visitors only ever see published hotels and active rooms.
-- Bookable units = total - blocked for now; Phase 7 also subtracts overlapping bookings.
-- -------------------------------------------------------------------------------------
create or replace function public.search_hotels(
  p_query text default null,
  p_destination text default null,
  p_min_price numeric default null,
  p_max_price numeric default null,
  p_stars smallint[] default null,
  p_min_rating numeric default null,
  p_types public.accommodation_type[] default null,
  p_amenities text[] default null,
  p_guests integer default 2,
  p_rooms integer default 1,
  p_available_only boolean default false,
  p_sort text default 'recommended',
  p_page integer default 1,
  p_page_size integer default 9
)
returns table (
  id uuid,
  slug text,
  name text,
  city text,
  accommodation_type public.accommodation_type,
  star_rating smallint,
  review_score numeric,
  review_count integer,
  popularity integer,
  short_description text,
  is_featured boolean,
  offer_label text,
  offer_discount_percent smallint,
  destination jsonb,
  cover_image jsonb,
  amenities jsonb,
  price_from numeric,
  has_availability boolean,
  total_count bigint,
  page integer
)
language sql
stable
set search_path = ''
as $$
  with params as (
    select
      nullif(lower(extensions.unaccent(btrim(coalesce(p_query, '')))), '') as q,
      greatest(1, least(coalesce(p_rooms, 1), 8)) as rooms,
      greatest(1, least(coalesce(p_guests, 2), 16)) as guests,
      greatest(1, least(coalesce(p_page_size, 9), 50)) as page_size
  ),
  room_stats as (
    select
      r.hotel_id,
      min(r.price_per_night) as price_from,
      bool_or(r.total_units - r.blocked_units > 0) as has_availability,
      bool_or(
        r.max_guests >= ceil(p.guests::numeric / p.rooms)
        and (not coalesce(p_available_only, false) or r.total_units - r.blocked_units >= p.rooms)
      ) as has_suitable_room
    from public.rooms r
    cross join params p
    where r.is_active
    group by r.hotel_id
  ),
  base as (
    select
      h.*,
      d.slug as destination_slug,
      jsonb_build_object('slug', d.slug, 'name', d.name, 'country', d.country) as destination_json,
      rs.price_from,
      rs.has_availability,
      -- Price shown on the card: cheapest room after any offer, rounded to the rupee.
      round(rs.price_from * (1 - coalesce(h.offer_discount_percent, 0) / 100.0)) as display_price,
      h.review_score * 10
        + log(10, h.popularity + 1) * 6
        + case when h.is_featured then 6 else 0 end
        + case when h.offer_label is not null then 3 else 0 end as recommended_score,
      coalesce(
        (select array_agg(a.slug) from public.hotel_amenities ha join public.amenities a on a.id = ha.amenity_id
          where ha.hotel_id = h.id),
        '{}'
      ) as amenity_slugs
    from public.hotels h
    join public.destinations d on d.id = h.destination_id
    join room_stats rs on rs.hotel_id = h.id
    cross join params p
    where h.is_published
      and h.archived_at is null
      and rs.has_suitable_room
      and (p.q is null or position(p.q in lower(extensions.unaccent(concat_ws(' ', h.name, h.city, d.name, d.country)))) > 0)
      and (p_destination is null or d.slug = p_destination)
      and (p_stars is null or cardinality(p_stars) = 0 or h.star_rating = any (p_stars))
      and (p_min_rating is null or h.review_score >= p_min_rating)
      and (p_types is null or cardinality(p_types) = 0 or h.accommodation_type = any (p_types))
  ),
  filtered as (
    select *
    from base b
    where (p_min_price is null or b.display_price >= p_min_price)
      and (p_max_price is null or b.display_price <= p_max_price)
      and (p_amenities is null or cardinality(p_amenities) = 0 or b.amenity_slugs @> p_amenities)
  ),
  ranked as (
    select
      f.*,
      count(*) over () as total,
      row_number() over (
        order by
          case when p_sort = 'price-asc' then f.display_price end asc,
          case when p_sort = 'price-desc' then f.display_price end desc,
          case when p_sort = 'rating' then f.review_score end desc,
          case when p_sort = 'rating' then f.review_count end desc,
          case when p_sort = 'popular' then f.popularity end desc,
          case when p_sort not in ('price-asc', 'price-desc', 'rating', 'popular') then f.recommended_score end desc,
          f.name asc
      ) as rn
    from filtered f
  ),
  paging as (
    -- Clamp the requested page to the last page that exists (so ?page=99 shows the last page).
    select
      p.page_size,
      greatest(1, least(coalesce(p_page, 1), ceil(coalesce(max(r.total), 0)::numeric / p.page_size)::int)) as page
    from params p
    left join ranked r on true
    group by p.page_size
  )
  select
    r.id, r.slug, r.name, r.city, r.accommodation_type, r.star_rating, r.review_score, r.review_count,
    r.popularity, r.short_description, r.is_featured, r.offer_label, r.offer_discount_percent,
    r.destination_json as destination,
    (select jsonb_build_object('url', i.url, 'alt', i.alt) from public.hotel_images i
      where i.hotel_id = r.id order by i.position limit 1) as cover_image,
    coalesce(
      (select jsonb_agg(jsonb_build_object('id', a.id, 'slug', a.slug, 'name', a.name) order by ha.position, a.display_order, a.name)
        from public.hotel_amenities ha join public.amenities a on a.id = ha.amenity_id where ha.hotel_id = r.id),
      '[]'::jsonb
    ) as amenities,
    r.price_from,
    r.has_availability,
    r.total as total_count,
    pg.page
  from ranked r
  cross join paging pg
  where r.rn > (pg.page - 1) * pg.page_size and r.rn <= pg.page * pg.page_size
  order by r.rn;
$$;

comment on function public.search_hotels is
  'Public hotel search: filters, sorting and pagination in one query. Runs as the caller, so RLS applies.';

-- Exposed to the Data API on purpose (read-only). Revoke the implicit PUBLIC grant, then grant explicitly.
revoke all on function public.search_hotels from public;
grant execute on function public.search_hotels to anon, authenticated, service_role;

-- The new columns are readable through the existing table grants (select on the whole table).
