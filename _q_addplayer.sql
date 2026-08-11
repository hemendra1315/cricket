BEGIN;
SELECT set_config('request.jwt.claims', '{"sub":"ddeea5d3-e9c0-402e-800a-6262c08e06b6"}', true);
SELECT auth.uid() AS auth_uid, public.is_super_admin() AS is_sa;

-- Add a Player via the Super Admin RPC (transaction rolled back afterwards).
SELECT public.super_admin_add_member(
  'd1945af3-17c7-4b07-8041-c4a78fd07e4f',
  'Debug Player One',
  'player',
  'debug.player.one@demo.academy',
  '+919000020001',
  null
) AS add_player_result;

SELECT
  (SELECT count(*) FROM academy_members WHERE academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f' AND role='player') AS players;

ROLLBACK;
