-- ============================================================================
-- Local development seed (`supabase db reset` runs this).
-- Creates two academies owned by two demo users so tenant isolation is easy to
-- exercise by hand. Auth users are inserted directly because the local stack has
-- no OAuth provider; the handle_new_user trigger creates the profiles.
-- ============================================================================

insert into auth.users (id, email, raw_user_meta_data)
values
  (
    '00000000-0000-4000-8000-000000000001',
    'owner.chennai@example.com',
    '{"full_name":"Ravi Owner","avatar_url":null}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    'owner.mumbai@example.com',
    '{"full_name":"Neha Owner","avatar_url":null}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000003',
    'player.demo@example.com',
    '{"full_name":"Arjun Player","avatar_url":null}'::jsonb
  )
on conflict (id) do nothing;

-- Two independent tenants, each with an owner membership and a player join code.
insert into academies (id, name, slug, city, owner_user_id)
values
  (
    '00000000-0000-4000-9000-000000000001',
    'Chennai Super Academy',
    'chennai-super-academy',
    'Chennai',
    '00000000-0000-4000-8000-000000000001'
  ),
  (
    '00000000-0000-4000-9000-000000000002',
    'Mumbai Cricket Works',
    'mumbai-cricket-works',
    'Mumbai',
    '00000000-0000-4000-8000-000000000002'
  )
on conflict (id) do nothing;

insert into academy_members (academy_id, user_id, role, status, joined_at)
values
  (
    '00000000-0000-4000-9000-000000000001',
    '00000000-0000-4000-8000-000000000001',
    'academy_owner',
    'active',
    now()
  ),
  (
    '00000000-0000-4000-9000-000000000002',
    '00000000-0000-4000-8000-000000000002',
    'academy_owner',
    'active',
    now()
  )
on conflict do nothing;

insert into academy_join_codes (academy_id, code, role, created_by)
values
  (
    '00000000-0000-4000-9000-000000000001',
    'CHE001',
    'player',
    '00000000-0000-4000-8000-000000000001'
  ),
  (
    '00000000-0000-4000-9000-000000000002',
    'MBA001',
    'player',
    '00000000-0000-4000-8000-000000000002'
  )
on conflict do nothing;
