-- =====================================================================================
-- TripNest — Row Level Security and Data API grants
--
-- Two layers (both required since Supabase stopped auto-exposing new tables):
--   1. GRANTs decide whether a role can reach a table at all over the Data API.
--   2. RLS policies decide which rows that role can read or change.
--
-- Roles: anon = signed-out visitor, authenticated = signed-in user (admin or not),
-- service_role = trusted server code (bypasses RLS; never shipped to the browser).
-- Admin rights come only from profiles.role, checked by private.is_admin().
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- Enable RLS on every table in the exposed schema
-- -------------------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.destinations enable row level security;
alter table public.hotels enable row level security;
alter table public.hotel_images enable row level security;
alter table public.amenities enable row level security;
alter table public.hotel_amenities enable row level security;
alter table public.rooms enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_guests enable row level security;
alter table public.saved_hotels enable row level security;
alter table public.reviews enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;

-- -------------------------------------------------------------------------------------
-- Start from zero: remove any default grants the project may add to new tables,
-- then grant exactly what each role needs.
-- -------------------------------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to service_role;

-- Public catalogue: readable by everyone (rows still filtered by RLS).
grant select on public.destinations, public.hotels, public.hotel_images, public.amenities,
  public.hotel_amenities, public.rooms, public.reviews
  to anon, authenticated;

-- Catalogue management: signed-in role only, and RLS limits it to admins.
grant insert, update, delete on public.destinations, public.hotels, public.hotel_images, public.amenities,
  public.hotel_amenities, public.rooms, public.reviews
  to authenticated;

-- Profiles: users may edit only these columns of their own row (never `role`, `email` or `id`).
grant select on public.profiles to authenticated;
grant update (full_name, phone, avatar_url) on public.profiles to authenticated;
-- No role can change `role` over the Data API. Admin role management (Phase 9) runs in a server
-- action that first verifies the caller is an admin, then uses the server-only secret key.

-- Bookings are created and cancelled through server-side functions in Phase 7, which recalculate
-- prices and check availability. Users can only read; admins can update the status.
grant select on public.bookings, public.booking_guests to authenticated;
grant update (status, cancelled_at) on public.bookings to authenticated;

-- Saved hotels: each user manages their own list.
grant select, insert, delete on public.saved_hotels to authenticated;

-- Public forms: anyone can submit; only admins can read.
grant insert on public.newsletter_subscribers, public.contact_messages to anon, authenticated;
grant select, delete on public.newsletter_subscribers, public.contact_messages to authenticated;

-- =====================================================================================
-- Policies
-- `(select auth.uid())` / `(select private.is_admin())` are wrapped in SELECT so Postgres
-- evaluates them once per query instead of once per row.
-- =====================================================================================

-- ---------------------------------- profiles -----------------------------------------
create policy "Users can view their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Admins can view all profiles"
  on public.profiles for select to authenticated
  using ((select private.is_admin()));

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Admins can update any profile"
  on public.profiles for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- -------------------------------- destinations ---------------------------------------
create policy "Anyone can view destinations"
  on public.destinations for select to anon, authenticated
  using (true);

create policy "Admins can insert destinations"
  on public.destinations for insert to authenticated
  with check ((select private.is_admin()));
create policy "Admins can update destinations"
  on public.destinations for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins can delete destinations"
  on public.destinations for delete to authenticated
  using ((select private.is_admin()));

-- ----------------------------------- hotels ------------------------------------------
create policy "Anyone can view published hotels"
  on public.hotels for select to anon, authenticated
  using (is_published and archived_at is null);

create policy "Admins can view all hotels"
  on public.hotels for select to authenticated
  using ((select private.is_admin()));

create policy "Admins can insert hotels"
  on public.hotels for insert to authenticated
  with check ((select private.is_admin()));
create policy "Admins can update hotels"
  on public.hotels for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins can delete hotels"
  on public.hotels for delete to authenticated
  using ((select private.is_admin()));

-- --------------------- hotel children: images, amenities, rooms ----------------------
-- Visible only when the parent hotel is visible (the hotels policy applies inside EXISTS).
create policy "Anyone can view images of visible hotels"
  on public.hotel_images for select to anon, authenticated
  using (exists (select 1 from public.hotels h where h.id = hotel_id));
create policy "Admins can manage hotel images"
  on public.hotel_images for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "Anyone can view amenities"
  on public.amenities for select to anon, authenticated
  using (true);
create policy "Admins can manage amenities"
  on public.amenities for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "Anyone can view amenities of visible hotels"
  on public.hotel_amenities for select to anon, authenticated
  using (exists (select 1 from public.hotels h where h.id = hotel_id));
create policy "Admins can manage hotel amenities"
  on public.hotel_amenities for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "Anyone can view active rooms of visible hotels"
  on public.rooms for select to anon, authenticated
  using (is_active and exists (select 1 from public.hotels h where h.id = hotel_id));
create policy "Admins can manage rooms"
  on public.rooms for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

-- ---------------------------------- bookings -----------------------------------------
create policy "Users can view their own bookings"
  on public.bookings for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Admins can view all bookings"
  on public.bookings for select to authenticated
  using ((select private.is_admin()));

create policy "Admins can update bookings"
  on public.bookings for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

-- ------------------------------- booking_guests --------------------------------------
create policy "Users can view guests on their own bookings"
  on public.booking_guests for select to authenticated
  using (exists (
    select 1 from public.bookings b
    where b.id = booking_id and b.user_id = (select auth.uid())
  ));

create policy "Admins can view all booking guests"
  on public.booking_guests for select to authenticated
  using ((select private.is_admin()));

-- -------------------------------- saved_hotels ---------------------------------------
create policy "Users can view their saved hotels"
  on public.saved_hotels for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can save visible hotels"
  on public.saved_hotels for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.hotels h where h.id = hotel_id)
  );

create policy "Users can remove their saved hotels"
  on public.saved_hotels for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------- reviews ------------------------------------------
create policy "Anyone can view published reviews of visible hotels"
  on public.reviews for select to anon, authenticated
  using (is_published and exists (select 1 from public.hotels h where h.id = hotel_id));

create policy "Admins can manage reviews"
  on public.reviews for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

-- ------------------------- newsletter / contact messages -----------------------------
create policy "Anyone can subscribe to the newsletter"
  on public.newsletter_subscribers for insert to anon, authenticated
  with check (true); -- column CHECK constraints validate the email
create policy "Admins can view subscribers"
  on public.newsletter_subscribers for select to authenticated
  using ((select private.is_admin()));
create policy "Admins can delete subscribers"
  on public.newsletter_subscribers for delete to authenticated
  using ((select private.is_admin()));

create policy "Anyone can send a contact message"
  on public.contact_messages for insert to anon, authenticated
  -- Signed-out senders cannot attach a user id; signed-in senders can only attach their own.
  with check (user_id is null or user_id = (select auth.uid()));
create policy "Admins can view contact messages"
  on public.contact_messages for select to authenticated
  using ((select private.is_admin()));
create policy "Admins can delete contact messages"
  on public.contact_messages for delete to authenticated
  using ((select private.is_admin()));
