-- ============================================================================
-- Phase 2 — transactional RPCs for people and approvals
-- Approving a request touches join_requests, academy_members and players/coaches;
-- doing it in one function keeps those three in step and checks permission once.
-- ============================================================================

-- Ensures the profile row that belongs to a role exists. Called wherever a
-- membership becomes active or changes role, so a roster can never contain a
-- member with no matching player/coach record.
create or replace function ensure_person_row(
  p_academy uuid,
  p_user uuid,
  p_role app_role
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_role = 'player' then
    insert into players (academy_id, user_id)
    values (p_academy, p_user)
    on conflict (academy_id, user_id) do update set is_active = true, deleted_at = null;
  elsif p_role = 'coach' then
    insert into coaches (academy_id, user_id)
    values (p_academy, p_user)
    on conflict (academy_id, user_id) do update set is_active = true, deleted_at = null;
  end if;
end $$;

-- ------------------------------------------------------ approve / reject ----
create or replace function approve_join_request(p_request uuid) returns academy_members
language plpgsql security definer set search_path = public as $$
declare
  v_request join_requests;
  v_member  academy_members;
begin
  select * into v_request from join_requests r where r.id = p_request for update;

  if v_request.id is null then
    raise exception 'E_NOT_FOUND' using errcode = 'P0002';
  end if;

  if not is_owner(v_request.academy_id) then
    raise exception 'E_FORBIDDEN' using errcode = '42501';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'E_REQUEST_NOT_PENDING' using errcode = '22023';
  end if;

  insert into academy_members (academy_id, user_id, role, status, joined_at, invited_by)
  values (v_request.academy_id, v_request.user_id, v_request.requested_role, 'active', now(), auth.uid())
  on conflict (academy_id, user_id, role)
    do update set status = 'active', joined_at = coalesce(academy_members.joined_at, now()), left_at = null
  returning * into v_member;

  perform ensure_person_row(v_request.academy_id, v_request.user_id, v_request.requested_role);

  update join_requests
     set status = 'approved', reviewed_by = auth.uid(), reviewed_at = now()
   where id = p_request;

  return v_member;
end $$;

create or replace function reject_join_request(
  p_request uuid,
  p_reason text default null
) returns join_requests
language plpgsql security definer set search_path = public as $$
declare
  v_request join_requests;
begin
  select * into v_request from join_requests r where r.id = p_request for update;

  if v_request.id is null then
    raise exception 'E_NOT_FOUND' using errcode = 'P0002';
  end if;

  if not is_owner(v_request.academy_id) then
    raise exception 'E_FORBIDDEN' using errcode = '42501';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'E_REQUEST_NOT_PENDING' using errcode = '22023';
  end if;

  update join_requests
     set status = 'rejected',
         reviewed_by = auth.uid(),
         reviewed_at = now(),
         rejection_reason = nullif(btrim(coalesce(p_reason, '')), '')
   where id = p_request
  returning * into v_request;

  return v_request;
end $$;

-- Owner view of the queue; join_requests RLS already restricts it to owners, but
-- the function saves the client an embed and keeps the shape stable.
create or replace function academy_join_requests(
  p_academy uuid,
  p_status join_status default 'pending'
)
returns table (
  request_id     uuid,
  user_id        uuid,
  full_name      text,
  email          text,
  avatar_url     text,
  requested_role app_role,
  status         join_status,
  message        text,
  created_at     timestamptz
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_owner(p_academy) then
    raise exception 'E_FORBIDDEN' using errcode = '42501';
  end if;

  return query
    select r.id, r.user_id, p.full_name, p.email::text, p.avatar_url,
           r.requested_role, r.status, r.message, r.created_at
    from join_requests r
    join profiles p on p.id = r.user_id
    where r.academy_id = p_academy and r.status = p_status
    order by r.created_at;
end $$;

-- ---------------------------------------------------------- member roles ----
-- Changing a role must create the matching person row, otherwise a promoted
-- player would not appear on the coach roster.
create or replace function set_member_role(
  p_member uuid,
  p_role app_role
) returns academy_members
language plpgsql security definer set search_path = public as $$
declare
  v_member academy_members;
begin
  if p_role not in ('player', 'coach') then
    raise exception 'E_VALIDATION: role must be player or coach' using errcode = '22023';
  end if;

  select * into v_member from academy_members m where m.id = p_member for update;

  if v_member.id is null then
    raise exception 'E_NOT_FOUND' using errcode = 'P0002';
  end if;

  if not is_owner(v_member.academy_id) then
    raise exception 'E_FORBIDDEN' using errcode = '42501';
  end if;

  if v_member.role = 'academy_owner' then
    raise exception 'E_FORBIDDEN' using errcode = '42501';
  end if;

  update academy_members set role = p_role where id = p_member returning * into v_member;
  perform ensure_person_row(v_member.academy_id, v_member.user_id, p_role);

  -- The profile for the role they left stays, but is retired from listings.
  if p_role = 'coach' then
    update players set is_active = false
     where academy_id = v_member.academy_id and user_id = v_member.user_id;
  else
    update coaches set is_active = false
     where academy_id = v_member.academy_id and user_id = v_member.user_id;
  end if;

  return v_member;
end $$;

-- ------------------------------------------------- self-service profiles ----
-- A player may maintain their own contact details but not academy-controlled
-- fields (skill level, player code, active flag), so the writable set is fixed
-- here rather than widening the RLS update policy.
create or replace function update_my_player_profile(
  p_academy uuid,
  p_date_of_birth date default null,
  p_batting_style text default null,
  p_bowling_style text default null,
  p_player_role text default null,
  p_jersey_number integer default null,
  p_guardian_name text default null,
  p_guardian_phone text default null,
  p_guardian_email text default null,
  p_emergency_contact text default null
) returns players
language plpgsql security definer set search_path = public as $$
declare
  v_player players;
begin
  update players
     set date_of_birth     = p_date_of_birth,
         batting_style     = nullif(btrim(coalesce(p_batting_style, '')), ''),
         bowling_style     = nullif(btrim(coalesce(p_bowling_style, '')), ''),
         player_role       = nullif(btrim(coalesce(p_player_role, '')), ''),
         jersey_number     = p_jersey_number,
         guardian_name     = nullif(btrim(coalesce(p_guardian_name, '')), ''),
         guardian_phone    = nullif(btrim(coalesce(p_guardian_phone, '')), ''),
         guardian_email    = nullif(btrim(coalesce(p_guardian_email, '')), '')::citext,
         emergency_contact = nullif(btrim(coalesce(p_emergency_contact, '')), '')
   where academy_id = p_academy and user_id = auth.uid()
  returning * into v_player;

  if v_player.id is null then
    raise exception 'E_NOT_FOUND' using errcode = 'P0002';
  end if;

  return v_player;
end $$;

revoke all on function ensure_person_row(uuid, uuid, app_role) from public;
revoke all on function approve_join_request(uuid) from public;
revoke all on function reject_join_request(uuid, text) from public;
revoke all on function set_member_role(uuid, app_role) from public;

grant execute on function approve_join_request(uuid) to authenticated;
grant execute on function reject_join_request(uuid, text) to authenticated;
grant execute on function academy_join_requests(uuid, join_status) to authenticated;
grant execute on function set_member_role(uuid, app_role) to authenticated;
grant execute on function update_my_player_profile(
  uuid, date, text, text, text, integer, text, text, text, text
) to authenticated;
