-- ============================================================================
-- Phase 3 (part 1) — row level security for batches
-- Members read their academy's batches; only owners write them.
-- ============================================================================

alter table venues enable row level security;
alter table batches enable row level security;
alter table batch_coaches enable row level security;
alter table batch_players enable row level security;

-- Is the caller a coach on this batch? Used by both RLS and the player policy,
-- so it is SECURITY DEFINER to avoid recursing through batch_coaches' own RLS.
create or replace function coaches_batch(p_batch uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from batch_coaches bc
    join coaches c on c.id = bc.coach_id
    where bc.batch_id = p_batch
      and c.user_id = auth.uid()
      and c.is_active
  );
$$;

/*
 * Players a coach may see: anyone sharing a batch with them. This is what makes
 * "a coach sees their assigned players" true — before batches existed the
 * players policy had to fall back to all academy staff.
 */
create or replace function shares_batch_with_player(p_player uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from batch_players bp
    join batch_coaches bc on bc.batch_id = bp.batch_id
    join coaches c on c.id = bc.coach_id
    where bp.player_id = p_player
      and bp.left_at is null
      and c.user_id = auth.uid()
      and c.is_active
  );
$$;

grant execute on function coaches_batch(uuid) to authenticated;
grant execute on function shares_batch_with_player(uuid) to authenticated;

drop policy players_select on players;

create policy players_select on players for select using (
  is_owner(academy_id)
  or user_id = auth.uid()
  or shares_batch_with_player(id)
  or is_super_admin()
);

-- venues and batches: readable by any member, written by owners only.
create policy venues_select on venues for select using (
  is_member(academy_id) or is_super_admin()
);
create policy venues_write on venues for all
  using (is_owner(academy_id)) with check (is_owner(academy_id));

create policy batches_select on batches for select using (
  is_member(academy_id) or is_super_admin()
);
create policy batches_write on batches for all
  using (is_owner(academy_id)) with check (is_owner(academy_id));

-- Rosters: a member sees the assignments of their own academy; owners edit them.
create policy batch_coaches_select on batch_coaches for select using (
  is_member(academy_id) or is_super_admin()
);
create policy batch_coaches_write on batch_coaches for all
  using (is_owner(academy_id)) with check (is_owner(academy_id));

-- A player sees their own batch links plus those of batches they train in; a
-- coach sees the roster of batches they are assigned to.
create policy batch_players_select on batch_players for select using (
  is_owner(academy_id)
  or coaches_batch(batch_id)
  or exists (
    select 1 from players p
    where p.id = batch_players.player_id and p.user_id = auth.uid()
  )
  or is_super_admin()
);
create policy batch_players_write on batch_players for all
  using (is_owner(academy_id)) with check (is_owner(academy_id));
