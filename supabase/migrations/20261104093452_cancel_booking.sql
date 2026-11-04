-- =====================================================================================
-- TripNest — cancel a demo booking (Phase 8)
--
-- Users have no UPDATE permission on bookings (so they cannot change prices or status directly).
-- This function is the one controlled way for an owner to cancel: only their own booking, only while
-- it is pending/confirmed, and only before the check-in date. SECURITY DEFINER, signed-in users only.
-- =====================================================================================

create or replace function public.cancel_booking(p_reference text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_booking public.bookings;
begin
  if v_user is null then
    raise exception 'not_signed_in' using errcode = 'P0001';
  end if;

  -- Lock the row so two cancels (or a cancel and an admin change) cannot interleave.
  select * into v_booking
  from public.bookings
  where reference = upper(btrim(p_reference)) and user_id = v_user
  for update;
  if not found then
    raise exception 'booking_not_found' using errcode = 'P0001';
  end if;

  if v_booking.status = 'cancelled' then
    return jsonb_build_object('reference', v_booking.reference, 'status', 'cancelled', 'already', true);
  end if;
  if v_booking.status not in ('pending', 'confirmed') or v_booking.check_in <= current_date then
    raise exception 'not_cancellable' using errcode = 'P0001';
  end if;

  update public.bookings set status = 'cancelled', cancelled_at = now() where id = v_booking.id;
  return jsonb_build_object('reference', v_booking.reference, 'status', 'cancelled', 'already', false);
end;
$$;

revoke all on function public.cancel_booking(text) from public, anon;
grant execute on function public.cancel_booking(text) to authenticated, service_role;
