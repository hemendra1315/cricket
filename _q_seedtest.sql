BEGIN;

SELECT set_config('request.jwt.claims', '{"sub":"ddeea5d3-e9c0-402e-800a-6262c08e06b6"}', true);

-- Sanity check: confirm we now look like the real Super Admin to is_super_admin().
SELECT auth.uid() AS auth_uid, public.is_super_admin() AS is_sa;

-- Call the ACTUAL deployed seed function on the real academy (transaction will be rolled back).
SELECT public.super_admin_seed_academy_demo_data('d1945af3-17c7-4b07-8041-c4a78fd07e4f') AS seed_result;

SELECT
  (SELECT count(*) FROM academy_members WHERE academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f' AND notes='demo_seed') AS demo_members,
  (SELECT count(*) FROM academy_members WHERE academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f' AND role='coach') AS coaches,
  (SELECT count(*) FROM academy_members WHERE academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f' AND role='player') AS players,
  (SELECT count(*) FROM batches WHERE academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f') AS batches,
  (SELECT count(*) FROM training_sessions WHERE academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f') AS sessions,
  (SELECT count(*) FROM matches WHERE academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f') AS matches;

ROLLBACK;