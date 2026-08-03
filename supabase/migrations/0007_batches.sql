-- ============================================================================
-- Phase 3 (part 1) — venues, batches and their coach/player rosters
-- Training sessions are deliberately absent; they arrive with attendance.
-- ============================================================================

create table venues (
  id         uuid primary key default gen_random_uuid(),
  academy_id uuid not null references academies (id) on delete cascade,
  name       text not null check (length(btrim(name)) between 2 and 120),
  address    text,
  nets_count integer check (nets_count is null or nets_count between 0 and 100),
  created_at timestamptz not null default now(),
  unique (academy_id, name)
);

create index venues_academy_idx on venues (academy_id);

create table batches (
  id                uuid primary key default gen_random_uuid(),
  academy_id        uuid not null references academies (id) on delete cascade,
  name              text not null check (length(btrim(name)) between 2 and 80),
  description       text,
  age_group         text check (age_group is null or length(btrim(age_group)) between 1 and 20),
  skill_level       skill_level,
  -- A venue belonging to another academy would leak a name across tenants, so
  -- the pair is validated by a trigger below rather than the FK alone.
  venue_id          uuid references venues (id) on delete set null,
  capacity          integer check (capacity is null or capacity between 1 and 500),
  monthly_fee_paise integer check (monthly_fee_paise is null or monthly_fee_paise >= 0),
  start_date        date,
  end_date          date,
  is_active         boolean not null default true,
  created_by        uuid references profiles (id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz,
  unique (academy_id, name),
  constraint batches_dates_ordered check (
    start_date is null or end_date is null or end_date >= start_date
  )
);

create index batches_academy_active_idx on batches (academy_id, is_active);

create trigger batches_set_updated_at
  before update on batches
  for each row execute function set_updated_at();

create table batch_coaches (
  academy_id  uuid not null references academies (id) on delete cascade,
  batch_id    uuid not null references batches (id) on delete cascade,
  coach_id    uuid not null references coaches (id) on delete cascade,
  is_primary  boolean not null default false,
  assigned_at timestamptz not null default now(),
  primary key (batch_id, coach_id)
);

create index batch_coaches_coach_idx on batch_coaches (coach_id);
create index batch_coaches_academy_idx on batch_coaches (academy_id);

-- At most one primary coach per batch.
create unique index batch_coaches_primary_idx
  on batch_coaches (batch_id) where is_primary;

create table batch_players (
  id         uuid primary key default gen_random_uuid(),
  academy_id uuid not null references academies (id) on delete cascade,
  batch_id   uuid not null references batches (id) on delete cascade,
  player_id  uuid not null references players (id) on delete cascade,
  joined_at  timestamptz not null default now(),
  left_at    timestamptz,
  -- Removing a player keeps the history: `left_at` is stamped, never deleted,
  -- so past attendance still resolves to a membership.
  is_active  boolean generated always as (left_at is null) stored
);

create unique index batch_players_active_idx
  on batch_players (batch_id, player_id) where left_at is null;
create index batch_players_player_idx
  on batch_players (player_id) where left_at is null;
create index batch_players_academy_idx on batch_players (academy_id);

-- ------------------------------------------------ cross-tenant consistency --
-- Every child row repeats `academy_id` so RLS can gate it with one predicate;
-- these triggers keep that copy honest against the parent rows.
create or replace function assert_batch_tenancy() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_academy uuid;
begin
  if new.venue_id is not null then
    select academy_id into v_academy from venues where id = new.venue_id;
    if v_academy is distinct from new.academy_id then
      raise exception 'E_VENUE_OTHER_ACADEMY' using errcode = '23514';
    end if;
  end if;
  return new;
end $$;

create trigger batches_assert_tenancy
  before insert or update of venue_id, academy_id on batches
  for each row execute function assert_batch_tenancy();

create or replace function assert_batch_member_tenancy() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_batch uuid; v_person uuid;
begin
  select academy_id into v_batch from batches where id = new.batch_id;

  if tg_table_name = 'batch_coaches' then
    select academy_id into v_person from coaches where id = new.coach_id;
  else
    select academy_id into v_person from players where id = new.player_id;
  end if;

  if v_batch is distinct from new.academy_id or v_person is distinct from new.academy_id then
    raise exception 'E_CROSS_ACADEMY' using errcode = '23514';
  end if;
  return new;
end $$;

create trigger batch_coaches_assert_tenancy
  before insert or update on batch_coaches
  for each row execute function assert_batch_member_tenancy();

create trigger batch_players_assert_tenancy
  before insert or update of batch_id, player_id, academy_id on batch_players
  for each row execute function assert_batch_member_tenancy();
