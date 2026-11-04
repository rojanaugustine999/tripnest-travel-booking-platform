-- =====================================================================================
-- TripNest — initial schema
-- Tables, enums, constraints and indexes for the full hotel booking workflow.
-- Functions/triggers: 20261104041914_functions_and_triggers.sql
-- RLS + grants:       20261104041946_rls_policies_and_grants.sql
-- =====================================================================================

-- Non-exposed schema for helper functions used by RLS policies and triggers.
-- It is NOT added to the Data API's exposed schemas, so nothing here is reachable over REST.
create schema if not exists private;

-- -------------------------------------------------------------------------------------
-- Enums
-- -------------------------------------------------------------------------------------
create type public.user_role as enum ('user', 'admin');
create type public.accommodation_type as enum ('hotel', 'resort', 'villa', 'boutique', 'apartment');
create type public.booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed');
create type public.contact_subject as enum ('booking', 'account', 'partnership', 'other');

-- -------------------------------------------------------------------------------------
-- profiles: one row per auth user (created by trigger on signup)
-- -------------------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text check (char_length(full_name) <= 100),
  phone text check (char_length(phone) <= 30),
  avatar_url text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on column public.profiles.email is 'Copy of auth.users.email, kept in sync by trigger for display and admin lists.';
comment on column public.profiles.role is 'Only admins (or the service role) can change this — users have no UPDATE grant on it.';

create index profiles_role_idx on public.profiles (role) where role = 'admin';

-- -------------------------------------------------------------------------------------
-- destinations
-- -------------------------------------------------------------------------------------
create table public.destinations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 80),
  country text not null,
  region text not null check (region in ('India', 'Asia', 'Middle East', 'Europe', 'Indian Ocean')),
  short_description text not null check (char_length(short_description) <= 200),
  description text not null,
  image_url text not null,
  -- Display content that is always read together with the destination.
  attractions jsonb not null default '[]'::jsonb check (jsonb_typeof(attractions) = 'array'),
  travel_info jsonb not null default '{}'::jsonb check (jsonb_typeof(travel_info) = 'object'),
  is_popular boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------------------
-- hotels
-- -------------------------------------------------------------------------------------
create table public.hotels (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  destination_id uuid not null references public.destinations (id) on delete restrict,
  name text not null check (char_length(name) between 2 and 120),
  city text not null,
  address text not null,
  accommodation_type public.accommodation_type not null,
  star_rating smallint not null check (star_rating between 1 and 5),
  -- Aggregates shown on cards. Sample data seeds them; a trigger can maintain them once reviews are live.
  review_score numeric(3, 1) not null default 0 check (review_score between 0 and 10),
  review_count integer not null default 0 check (review_count >= 0),
  popularity integer not null default 0 check (popularity >= 0),
  short_description text not null check (char_length(short_description) <= 200),
  description text not null,
  facilities text[] not null default '{}',
  check_in_time time not null default '14:00',
  check_out_time time not null default '11:00',
  cancellation_policy text not null,
  is_featured boolean not null default false,
  offer_label text,
  offer_discount_percent smallint check (offer_discount_percent between 1 and 90),
  is_published boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- An offer needs both a label and a discount, or neither.
  constraint hotels_offer_complete check ((offer_label is null) = (offer_discount_percent is null))
);

create index hotels_destination_id_idx on public.hotels (destination_id);
-- Public listing only ever reads published, non-archived hotels.
create index hotels_public_listing_idx on public.hotels (review_score desc)
  where is_published and archived_at is null;

-- -------------------------------------------------------------------------------------
-- hotel_images
-- -------------------------------------------------------------------------------------
create table public.hotel_images (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels (id) on delete cascade,
  url text not null,
  alt text not null check (char_length(alt) between 3 and 200),
  position smallint not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  constraint hotel_images_position_unique unique (hotel_id, position)
);

-- -------------------------------------------------------------------------------------
-- amenities + hotel_amenities (many-to-many)
-- -------------------------------------------------------------------------------------
create table public.amenities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null unique
);

create table public.hotel_amenities (
  hotel_id uuid not null references public.hotels (id) on delete cascade,
  amenity_id uuid not null references public.amenities (id) on delete cascade,
  primary key (hotel_id, amenity_id)
);
-- The PK covers lookups by hotel_id; this covers "hotels with amenity X".
create index hotel_amenities_amenity_id_idx on public.hotel_amenities (amenity_id);

-- -------------------------------------------------------------------------------------
-- rooms (room types)
-- -------------------------------------------------------------------------------------
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  description text not null,
  price_per_night numeric(10, 2) not null check (price_per_night > 0),
  max_guests smallint not null check (max_guests between 1 and 20),
  bed_info text not null,
  size_sqm smallint check (size_sqm > 0),
  amenities text[] not null default '{}',
  total_units smallint not null check (total_units >= 0),
  -- Units taken out of sale by the hotel (maintenance, owner use). Bookable = total - blocked - booked.
  blocked_units smallint not null default 0,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rooms_blocked_within_total check (blocked_units between 0 and total_units)
);

create index rooms_hotel_id_idx on public.rooms (hotel_id);

-- -------------------------------------------------------------------------------------
-- bookings
-- -------------------------------------------------------------------------------------
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique check (reference ~ '^TN-[A-Z0-9]{8}$'),
  user_id uuid not null references public.profiles (id) on delete cascade,
  hotel_id uuid not null references public.hotels (id) on delete restrict,
  room_id uuid not null references public.rooms (id) on delete restrict,
  check_in date not null,
  check_out date not null,
  nights integer generated always as (check_out - check_in) stored,
  guest_count smallint not null check (guest_count between 1 and 16),
  room_count smallint not null check (room_count between 1 and 8),
  -- Price snapshot: what was agreed at booking time, unaffected by later price changes.
  original_nightly_price numeric(10, 2) not null check (original_nightly_price > 0),
  nightly_price numeric(10, 2) not null check (nightly_price > 0),
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  taxes numeric(12, 2) not null default 0 check (taxes >= 0),
  fees numeric(12, 2) not null default 0 check (fees >= 0),
  total_amount numeric(12, 2) not null check (total_amount >= 0),
  currency char(3) not null default 'INR',
  status public.booking_status not null default 'pending',
  -- Every booking in this version is a demo: no payment is taken and no hotel is contacted.
  is_demo boolean not null default true,
  -- Sent by the client with each submission; a retry with the same key cannot create a second booking.
  idempotency_key uuid not null,
  special_requests text check (char_length(special_requests) <= 1000),
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_dates_valid check (check_out > check_in and check_out - check_in <= 30),
  constraint bookings_total_matches check (total_amount = subtotal + taxes + fees),
  constraint bookings_idempotency_unique unique (user_id, idempotency_key)
);

-- "My bookings" (newest first) — also serves lookups by user_id alone.
create index bookings_user_id_created_at_idx on public.bookings (user_id, created_at desc);
create index bookings_hotel_id_idx on public.bookings (hotel_id);
create index bookings_room_id_idx on public.bookings (room_id);
-- Availability checks: overlapping stays for a room type that still hold inventory.
create index bookings_room_availability_idx on public.bookings (room_id, check_in, check_out)
  where status in ('pending', 'confirmed');
create index bookings_status_created_at_idx on public.bookings (status, created_at desc);

-- -------------------------------------------------------------------------------------
-- booking_guests
-- -------------------------------------------------------------------------------------
create table public.booking_guests (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 100),
  email text check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (char_length(phone) <= 30),
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index booking_guests_booking_id_idx on public.booking_guests (booking_id);
-- Exactly zero or one lead guest per booking.
create unique index booking_guests_one_primary_idx on public.booking_guests (booking_id) where is_primary;

-- -------------------------------------------------------------------------------------
-- saved_hotels (composite PK prevents duplicates)
-- -------------------------------------------------------------------------------------
create table public.saved_hotels (
  user_id uuid not null references public.profiles (id) on delete cascade,
  hotel_id uuid not null references public.hotels (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, hotel_id)
);

create index saved_hotels_hotel_id_idx on public.saved_hotels (hotel_id);

-- -------------------------------------------------------------------------------------
-- reviews
-- -------------------------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels (id) on delete cascade,
  -- Null for imported/sample reviews; set for reviews written by TripNest users.
  user_id uuid references public.profiles (id) on delete set null,
  booking_id uuid unique references public.bookings (id) on delete set null,
  author_name text not null check (char_length(author_name) between 2 and 80),
  author_country text,
  rating numeric(3, 1) not null check (rating between 1 and 10),
  title text not null check (char_length(title) between 3 and 120),
  comment text not null check (char_length(comment) between 10 and 2000),
  stayed_on date,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index reviews_hotel_id_created_at_idx on public.reviews (hotel_id, created_at desc);
create index reviews_user_id_idx on public.reviews (user_id);

-- -------------------------------------------------------------------------------------
-- newsletter_subscribers / contact_messages (public forms)
-- -------------------------------------------------------------------------------------
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now()
);
create unique index newsletter_subscribers_email_idx on public.newsletter_subscribers (lower(email));

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject public.contact_subject not null,
  message text not null check (char_length(message) between 20 and 2000),
  created_at timestamptz not null default now()
);
create index contact_messages_created_at_idx on public.contact_messages (created_at desc);
create index contact_messages_user_id_idx on public.contact_messages (user_id);
