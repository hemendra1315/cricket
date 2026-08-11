-- Second call must be rejected by duplicate protection (notes='demo_seed' already exists).
BEGIN;
SELECT set_config('request.jwt.claims', '{"sub":"ddeea5d3-e9c0-402e-800a-6262c08e06b6"}', true);

SELECT public.super_admin_seed_academy_demo_data('d1945af3-17c7-4b07-8041-c4a78fd07e4f') AS should_be_duplicate;

ROLLBACK;
