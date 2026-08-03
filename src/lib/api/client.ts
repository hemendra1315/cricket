import type { PostgrestSingleResponse } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase/client';

import { ApiError, ApiErrorCode, toApiError } from './errors';

/**
 * Thin API layer used by every feature's api module.
 *
 * - `unwrap` turns a Supabase response into data-or-throw so TanStack Query can
 *   handle errors uniformly.
 * - `rpc` / `invoke` wrap Postgres functions and Edge Functions with the same
 *   error normalization and (for Edge Functions) idempotency-key support.
 */
export async function unwrap<T>(promise: PromiseLike<PostgrestSingleResponse<T>>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw toApiError(error);
  if (data === null) throw new ApiError(ApiErrorCode.NOT_FOUND, 'No data returned.');
  return data;
}

export async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  // Cast required until the generated Database type includes Phase 1 functions.
  const query = supabase.rpc(fn as never, args as never) as unknown as PromiseLike<
    PostgrestSingleResponse<T>
  >;
  const { data, error } = await query;
  if (error) throw toApiError(error);
  return data as T;
}

export async function invoke<T>(
  functionName: string,
  options?: { body?: Record<string, unknown>; idempotencyKey?: string },
): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(functionName, {
    body: options?.body,
    headers: options?.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : undefined,
  });
  if (error) throw toApiError(error);
  return data as T;
}

/** Keyset pagination helper shared by list endpoints. */
export type Page<T> = { rows: T[]; nextCursor: string | null };

export function toPage<T extends { created_at: string }>(rows: T[], limit: number): Page<T> {
  const hasMore = rows.length === limit;
  const last = rows.at(-1);
  return { rows, nextCursor: hasMore && last ? last.created_at : null };
}
