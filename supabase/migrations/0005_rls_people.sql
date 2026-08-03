-- ============================================================================
-- Phase 2 — row level security for people
-- Isolation rule is unchanged: every read is gated on an active membership in
-- the row's academy, so no client filter can widen it.
-- ============================================================================

alter table players enable row level security;
alter table coaches enable row level security;

-- players: staff of the academy manage the roster; a player reads their own row.
create policy players_select on players for select using (
  is_staff(academy_id) or user_id = auth.uid() or is_super_admin()
);

create policy players_insert on players for insert with check (is_owner(academy_id));

create policy players_update on players for update
  using (is_owner(academy_id)) with check (is_owner(academy_id));

create policy players_delete on players for delete using (is_owner(academy_id));

-- coaches: visible to everyone in the academy (players need to know who coaches
-- them); owners manage rows and a coach may edit their own profile.
create policy coaches_select on coaches for select using (
  is_member(academy_id) or is_super_admin()
);

create policy coaches_insert on coaches for insert with check (is_owner(academy_id));

create policy coaches_update on coaches for update
  using (is_owner(academy_id) or user_id = auth.uid())
  with check (is_owner(academy_id) or user_id = auth.uid());

create policy coaches_delete on coaches for delete using (is_owner(academy_id));
