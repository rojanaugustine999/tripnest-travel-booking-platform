-- =====================================================================================
-- TripNest — functions and triggers
-- All helpers live in the non-exposed `private` schema, so they are not callable over the Data API.
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- updated_at maintenance
-- -------------------------------------------------------------------------------------
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();
create trigger destinations_set_updated_at before update on public.destinations
  for each row execute function private.set_updated_at();
create trigger hotels_set_updated_at before update on public.hotels
  for each row execute function private.set_updated_at();
create trigger rooms_set_updated_at before update on public.rooms
  for each row execute function private.set_updated_at();
create trigger bookings_set_updated_at before update on public.bookings
  for each row execute function private.set_updated_at();

-- -------------------------------------------------------------------------------------
-- Profile creation on signup, and email sync
-- SECURITY DEFINER is required: the trigger runs as the Auth service, which cannot write
-- to public.profiles itself. The role is always 'user' — never taken from signup metadata,
-- because raw_user_meta_data is user-editable.
-- -------------------------------------------------------------------------------------
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(left(trim(new.raw_user_meta_data ->> 'full_name'), 100), '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace function private.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = coalesce(new.email, '') where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function private.handle_user_email_change();

-- -------------------------------------------------------------------------------------
-- Role check used by RLS policies
-- SECURITY DEFINER so the lookup is not itself filtered by profiles RLS (avoids recursion).
-- It only ever answers "is the *calling* user an admin?" — it takes no arguments.
-- -------------------------------------------------------------------------------------
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

-- -------------------------------------------------------------------------------------
-- Defence in depth: block role changes by anyone except admins / the service role.
-- Column grants (next migration) already stop users updating `role`; this also covers
-- SQL running inside future SECURITY INVOKER functions.
-- -------------------------------------------------------------------------------------
create or replace function private.guard_profile_role()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and (select auth.uid()) is not null          -- requests made with a user session
     and not (select private.is_admin()) then
    raise exception 'Only administrators can change user roles'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role
  before update of role on public.profiles
  for each row execute function private.guard_profile_role();

-- -------------------------------------------------------------------------------------
-- Function privileges
-- Postgres grants EXECUTE to PUBLIC by default. Revoke it everywhere, then grant only what
-- RLS evaluation needs: signed-in users must be able to evaluate private.is_admin().
-- (Trigger functions do not need EXECUTE grants for the roles that fire them.)
-- -------------------------------------------------------------------------------------
revoke all on all functions in schema private from public, anon, authenticated;
revoke all on schema private from public, anon;

grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;
