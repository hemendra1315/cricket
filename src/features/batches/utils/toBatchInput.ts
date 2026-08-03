import type { BatchFormValues } from '@/lib/validators';
import type { Batch } from '@/types';
import type { SkillLevel } from '@/types/enums';

import type { BatchInput } from '../api/batchesApi';

const blankToNull = (value: string): string | null => (value.trim() === '' ? null : value.trim());

/** Form values to a database row: rupees become paise and blanks become nulls. */
export function toBatchInput(values: BatchFormValues): BatchInput {
  return {
    name: values.name.trim(),
    description: blankToNull(values.description ?? ''),
    ageGroup: blankToNull(values.ageGroup ?? ''),
    skillLevel: (blankToNull(values.skillLevel) as SkillLevel | null) ?? null,
    venueId: blankToNull(values.venueId),
    capacity: values.capacity === '' ? null : Number(values.capacity),
    monthlyFeePaise: values.monthlyFeeRupees === '' ? null : Number(values.monthlyFeeRupees) * 100,
    startDate: blankToNull(values.startDate),
    endDate: blankToNull(values.endDate),
  };
}

export function toBatchFormValues(batch: Batch | null): BatchFormValues {
  return {
    name: batch?.name ?? '',
    description: batch?.description ?? '',
    ageGroup: batch?.ageGroup ?? '',
    skillLevel: batch?.skillLevel ?? '',
    venueId: batch?.venueId ?? '',
    capacity: batch?.capacity === null || batch === null ? '' : String(batch.capacity),
    monthlyFeeRupees:
      batch?.monthlyFeePaise === null || batch === undefined || batch === null
        ? ''
        : String(batch.monthlyFeePaise / 100),
    startDate: batch?.startDate ?? '',
    endDate: batch?.endDate ?? '',
  };
}
