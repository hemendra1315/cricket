-- ============================================================================
-- Phase 3 (part 1) follow-ups found during review
-- ============================================================================

-- The client inserts a batch directly, so `created_by` was silently left null.
alter table batches alter column created_by set default auth.uid();

/*
 * A soft-deleted batch kept its name reserved, so an owner could not reuse the
 * name of a batch they had deleted. Only live batches need unique names.
 */
alter table batches drop constraint batches_academy_id_name_key;

create unique index batches_academy_name_idx
  on batches (academy_id, name) where deleted_at is null;
