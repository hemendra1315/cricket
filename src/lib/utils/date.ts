import dayjs from 'dayjs';
import timezonePlugin from 'dayjs/plugin/timezone';
import utcPlugin from 'dayjs/plugin/utc';

import { env } from '@/lib/env';

dayjs.extend(utcPlugin);
dayjs.extend(timezonePlugin);

/**
 * Timestamps are stored UTC and rendered in the academy's timezone
 * (default Asia/Kolkata). Always format through these helpers.
 */
export function inAcademyTz(value: string | Date, timezone = env.defaultTimezone) {
  return dayjs.utc(value).tz(timezone);
}

export function formatDate(value: string | Date, timezone = env.defaultTimezone): string {
  return inAcademyTz(value, timezone).format('DD MMM YYYY');
}

export function formatTime(value: string | Date, timezone = env.defaultTimezone): string {
  return inAcademyTz(value, timezone).format('h:mm A');
}

export function formatDateTime(value: string | Date, timezone = env.defaultTimezone): string {
  return inAcademyTz(value, timezone).format('DD MMM YYYY, h:mm A');
}

export function toIsoDate(value: string | Date, timezone = env.defaultTimezone): string {
  return inAcademyTz(value, timezone).format('YYYY-MM-DD');
}

export { dayjs };
