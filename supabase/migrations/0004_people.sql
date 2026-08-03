-- ============================================================================
-- Phase 2 — people
-- Subset of docs/DB-SCHEMA.sql §4: players and coaches. A membership says what
-- someone may do; these tables hold the cricket-specific profile behind it.
-- Batch/venue assignment arrives with batches in a later phase.
-- ============================================================================

create type skill_level as enum ('beginner', 'intermediate', 'advanced', 'elite');

-- -------------------------------------------------------------- players -----
create table players (
  id                uuid primary key default gen_random_uuid(),
  academy_id        uuid not null references academies (id) on delete cascade,
  -- null user_id supports offline-managed players (no login), per the PRD.
  user_id           uuid references profiles (id) on delete set null,
  player_code       text check (player_code is null or length(btrim(player_code)) between 1 and 32),
  date_of_birth     date check (date_of_birth is null or date_of_birth < current_date),
  batting_style     text check (batting_style in ('right_hand', 'left_hand')),
  bowling_style     text,
  player_role       text check (player_role in ('batsman', 'bowler', 'all_rounder', 'wicketkeeper')),
  skill_level       skill_level not null default 'beginner',
  jersey_number     integer check (jersey_number is null or jersey_number between 0 and 999),
  guardian_name     text,
  guardian_phone    text,
  guardian_email    citext,
  emergency_contact text,
  medical_notes     text,
  joined_on         date not null default current_date,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz,
  unique (academy_id, user_id)
);

-- Partial unique index rather than a table constraint: player_code is optional,
-- and several players may legitimately have none.
create unique index players_academy_code_idx
  on players (academy_id, player_code) where player_code is not null;
create index players_academy_active_idx on players (academy_id, is_active);

create trigger players_set_updated_at
  before update on players
  for each row execute function set_updated_at();

-- -------------------------------------------------------------- coaches -----
create table coaches (
  id               uuid primary key default gen_random_uuid(),
  academy_id       uuid not null references academies (id) on delete cascade,
  user_id          uuid not null references profiles (id) on delete cascade,
  specialization   text[] not null default '{}',
  certifications   jsonb not null default '[]'::jsonb,
  bio              text,
  experience_years integer check (experience_years is null or experience_years between 0 and 70),
  availability     jsonb not null default '{}'::jsonb,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz,
  unique (academy_id, user_id)
);

create index coaches_academy_active_idx on coaches (academy_id, is_active);

create trigger coaches_set_updated_at
  before update on coaches
  for each row execute function set_updated_at();

-- ------------------------------------------------------------ backfill ------
-- Academies created before this migration already have player/coach members.
insert into players (academy_id, user_id)
select m.academy_id, m.user_id
from academy_members m
where m.role = 'player' and m.status = 'active'
on conflict (academy_id, user_id) do nothing;

insert into coaches (academy_id, user_id)
select m.academy_id, m.user_id
from academy_members m
where m.role = 'coach' and m.status = 'active'
on conflict (academy_id, user_id) do nothing;
