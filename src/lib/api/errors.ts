import type { PostgrestError } from '@supabase/supabase-js';

/** Stable error codes shared with the API plan's Edge Function contract. */
export const ApiErrorCode = {
  UNKNOWN: 'E_UNKNOWN',
  NETWORK: 'E_NETWORK',
  UNAUTHENTICATED: 'E_UNAUTHENTICATED',
  FORBIDDEN: 'E_FORBIDDEN',
  NOT_FOUND: 'E_NOT_FOUND',
  CONFLICT: 'E_CONFLICT',
  VALIDATION: 'E_VALIDATION',
  RATE_LIMITED: 'E_RATE_LIMITED',
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;
  readonly details?: unknown;

  constructor(
    code: ApiErrorCode,
    message: string,
    options?: { status?: number; details?: unknown },
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = options?.status;
    this.details = options?.details;
  }
}

const PG_CODE_MAP: Record<string, ApiErrorCode> = {
  '23505': ApiErrorCode.CONFLICT, // unique violation
  '23503': ApiErrorCode.VALIDATION, // fk violation
  '42501': ApiErrorCode.FORBIDDEN, // insufficient privilege / RLS
  PGRST301: ApiErrorCode.UNAUTHENTICATED,
};

/** Normalizes any thrown value (Postgrest, fetch, Error) into an ApiError. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (isPostgrestError(error)) {
    const code = PG_CODE_MAP[error.code] ?? ApiErrorCode.UNKNOWN;
    return new ApiError(code, error.message, { details: error.details });
  }

  if (error instanceof TypeError) {
    return new ApiError(ApiErrorCode.NETWORK, 'Network request failed. Check your connection.');
  }

  if (error instanceof Error) {
    return new ApiError(ApiErrorCode.UNKNOWN, error.message);
  }

  return new ApiError(ApiErrorCode.UNKNOWN, 'Something went wrong.');
}

function isPostgrestError(value: unknown): value is PostgrestError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    'code' in value &&
    typeof (value as { code: unknown }).code === 'string'
  );
}

/** Human-readable message for UI surfaces. */
export function errorMessage(error: unknown): string {
  const apiError = toApiError(error);
  switch (apiError.code) {
    case ApiErrorCode.UNAUTHENTICATED:
      return 'Your session expired. Please sign in again.';
    case ApiErrorCode.FORBIDDEN:
      return 'You do not have permission to do that.';
    case ApiErrorCode.NOT_FOUND:
      return 'We could not find what you were looking for.';
    case ApiErrorCode.NETWORK:
      return 'You appear to be offline. We will retry automatically.';
    case ApiErrorCode.RATE_LIMITED:
      return 'Too many attempts. Please try again in a few minutes.';
    default:
      return apiError.message || 'Something went wrong.';
  }
}
