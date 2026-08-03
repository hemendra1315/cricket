-- ============================================================================
-- Phase 3 (part 1) — batch roster RPCs
-- Multi-row writes (capacity checks, primary-coach swaps, soft deletes that also
-- release the roster) live here so they cannot half-apply from the client.
-- ============================================================================

/*
 * Adds players to one batch, skipping anyone already in it, and refuses the
 * whole call when the batch would exceed `capacity`. Returns the number added.
 */
create or replace function add_players_to_batch(
  p_batch uuid,
  p_players uuid[]
) returns integer
language plpgsql security definer set search_path = public as $$
declare
  v_academy  uuid;
  v_capacity integer;
  v_current  integer;
  v_added    integer;
begin
  select academy_id, capacity into v_academy, v_capacity
  from batches where id = p_batch and deleted_at is null
  for update;

  if v_academy is null then
    raise exception 'E_BATCH_NOT_FOUND' using errcode = 'P0002';
  end if;
  if not is_owner(v_academy) then
    raise exception 'E_FORBIDDEN' using errcode = '42501';
  end if;

  with candidates as (
    select p.id
    from players p
    where p.id = any (p_players)
      and p.academy_id = v_academy
      and p.is_active
      and not exists (
        select 1 from batch_players bp
        where bp.batch_id = p_batch and bp.player_id = p.id and bp.left_at is null
      )
  )
  select count(*) into v_added from candidates;

  select count(*) into v_current
  from batch_players where batch_id = p_batch and left_at is null;

  if v_capacity is not null and v_current + v_added > v_capacity then
    raise exception 'E_BATCH_FULL' using errcode = '23514';
  end if;

  insert into batch_players (academy_id, batch_id, player_id)
  select v_academy, p_batch, p.id
  from players p
  where p.id = any (p_players)
    and p.academy_id = v_academy
    and p.is_active
    and not exists (
      select 1 from batch_players bp
      where bp.batch_id = p_batch and bp.player_id = p.id and bp.left_at is null
    );

  return v_added;
end $$;

/** Releases a player from a batch without losing the history. */
create or replace function remove_player_from_batch(
  p_batch uuid,
  p_player uuid
) returns void
language plpgsql security definer set search_path = public as $$
declare v_academy uuid;
begin
  select academy_id into v_academy from batches where id = p_batch;
  if v_academy is null then
    raise exception 'E_BATCH_NOT_FOUND' using errcode = 'P0002';
  end if;
  if not is_owner(v_academy) then
    raise exception 'E_FORBIDDEN' using errcode = '42501';
  end if;

  update batch_players
  set left_at = now()
  where batch_id = p_batch and player_id = p_player and left_at is null;
end $$;

/**
 * Assigns one player to exactly the given batches: batches they are in but which
 * are not listed are left, the rest are added (each capacity-checked).
 */
create or replace function assign_player_to_batches(
  p_player uuid,
  p_batches uuid[]
) returns integer
language plpgsql security definer set search_path = public as $$
declare
  v_academy uuid;
  v_batch   uuid;
  v_added   integer := 0;
begin
  select academy_id into v_academy from players where id = p_player;
  if v_academy is null then
    raise exception 'E_PLAYER_NOT_FOUND' using errcode = 'P0002';
  end if;
  if not is_owner(v_academy) then
    raise exception 'E_FORBIDDEN' using errcode = '42501';
  end if;

  update batch_players
  set left_at = now()
  where player_id = p_player
    and left_at is null
    and not (batch_id = any (coalesce(p_batches, '{}'::uuid[])));

  foreach v_batch in array coalesce(p_batches, '{}'::uuid[]) loop
    v_added := v_added + add_players_to_batch(v_batch, array[p_player]);
  end loop;

  return v_added;
end $$;

/**
 * Assigns a coach to a batch. Marking one primary demotes the previous primary,
 * which the partial unique index would otherwise reject.
 */
create or replace function assign_coach_to_batch(
  p_batch uuid,
  p_coach uuid,
  p_is_primary boolean default false
) returns void
language plpgsql security definer set search_path = public as $$
declare v_academy uuid;
begin
  select academy_id into v_academy from batches where id = p_batch and deleted_at is null;
  if v_academy is null then
    raise exception 'E_BATCH_NOT_FOUND' using errcode = 'P0002';
  end if;
  if not is_owner(v_academy) then
    raise exception 'E_FORBIDDEN' using errcode = '42501';
  end if;
  if not exists (
    select 1 from coaches where id = p_coach and academy_id = v_academy and is_active
  ) then
    raise exception 'E_COACH_NOT_FOUND' using errcode = 'P0002';
  end if;

  if p_is_primary then
    update batch_coaches set is_primary = false
    where batch_id = p_batch and is_primary and coach_id <> p_coach;
  end if;

  insert into batch_coaches (academy_id, batch_id, coach_id, is_primary)
  values (v_academy, p_batch, p_coach, p_is_primary)
  on conflict (batch_id, coach_id) do update set is_primary = excluded.is_primary;
end $$;

create or replace function remove_coach_from_batch(
  p_batch uuid,
  p_coach uuid
) returns void
language plpgsql security definer set search_path = public as $$
declare v_academy uuid;
begin
  select academy_id into v_academy from batches where id = p_batch;
  if v_academy is null then
    raise exception 'E_BATCH_NOT_FOUND' using errcode = 'P0002';
  end if;
  if not is_owner(v_academy) then
    raise exception 'E_FORBIDDEN' using errcode = '42501';
  end if;

  delete from batch_coaches where batch_id = p_batch and coach_id = p_coach;
end $$;

/**
 * Soft-deletes a batch and releases its roster in the same transaction, so no
 * player is left pointing at a batch that is no longer scheduled.
 */
create or replace function delete_batch(p_batch uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_academy uuid;
begin
  select academy_id into v_academy from batches where id = p_batch and deleted_at is null
  for update;

  if v_academy is null then
    raise exception 'E_BATCH_NOT_FOUND' using errcode = 'P0002';
  end if;
  if not is_owner(v_academy) then
    raise exception 'E_FORBIDDEN' using errcode = '42501';
  end if;

  update batch_players set left_at = now() where batch_id = p_batch and left_at is null;
  delete from batch_coaches where batch_id = p_batch;
  update batches set deleted_at = now(), is_active = false where id = p_batch;
end $$;

grant execute on function add_players_to_batch(uuid, uuid[]) to authenticated;
grant execute on function remove_player_from_batch(uuid, uuid) to authenticated;
grant execute on function assign_player_to_batches(uuid, uuid[]) to authenticated;
grant execute on function assign_coach_to_batch(uuid, uuid, boolean) to authenticated;
grant execute on function remove_coach_from_batch(uuid, uuid) to authenticated;
grant execute on function delete_batch(uuid) to authenticated;
