-- Commits ONE seed of demo data onto the real Hemu academy as the real Super Admin,
-- then verifies the full persisted data set. Run ONCE; a second run must raise E_DUPLICATE.
BEGIN;
SELECT set_config('request.jwt.claims', '{"sub":"ddeea5d3-e9c0-402e-800a-6262c08e06b6"}', true);

SELECT public.is_super_admin() AS is_sa;

SELECT public.super_admin_seed_academy_demo_data('d1945af3-17c7-4b07-8041-c4a78fd07e4f') AS seed_result;

SELECT
  (SELECT count(*) FROM academy_members WHERE academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f' AND notes='demo_seed') AS demo_seed_members,
  (SELECT count(*) FROM academy_members WHERE academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f' AND role='coach' AND notes='demo_seed') AS demo_coaches,
  (SELECT count(*) FROM academy_members WHERE academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f' AND role='player' AND notes='demo_seed') AS demo_players,
  (SELECT count(*) FROM batches WHERE academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f') AS batches,
  (SELECT count(*) FROM training_sessions WHERE academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f') AS sessions,
  (SELECT count(*) FROM attendance WHERE academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f') AS attendance_rows,
  (SELECT count(*) FROM matches WHERE academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f') AS matches,
  (SELECT count(*) FROM match_lineups l JOIN matches m ON m.id=l.match_id WHERE m.academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f') AS lineups,
  (SELECT count(*) FROM match_batting b JOIN matches m ON m.id=b.match_id WHERE m.academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f') AS batting,
  (SELECT count(*) FROM match_bowling b JOIN matches m ON m.id=b.match_id WHERE m.academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f') AS bowling,
  (SELECT count(*) FROM match_fielding f JOIN matches m ON m.id=f.match_id WHERE m.academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f') AS fielding,
  (SELECT count(*) FROM match_awards a JOIN matches m ON m.id=a.match_id WHERE m.academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f') AS awards,
    (SELECT count(*) FROM player_statistics WHERE academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f') AS player_statistics;

COMMIT;
