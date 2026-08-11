select
  (select count(*) from academy_members where academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f' and role='coach') as coaches,
  (select count(*) from academy_members where academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f' and role='player') as players,
  (select count(*) from academy_members where academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f' and notes='demo_seed') as notes_demo_seed,
  (select count(*) from batches where academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f') as batches,
  (select count(*) from training_sessions where academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f') as sessions,
  (select count(*) from matches where academy_id='d1945af3-17c7-4b07-8041-c4a78fd07e4f') as matches;