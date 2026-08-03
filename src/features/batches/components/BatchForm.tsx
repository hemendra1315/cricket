import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FormField } from '@/components/form';
import { Button, CardBody, CardFooter, Input, Select, Textarea } from '@/components/ui';
import { errorMessage } from '@/lib/api';
import { batchFormSchema, type BatchFormValues } from '@/lib/validators';
import type { Batch, Venue } from '@/types';
import { SKILL_LEVELS, SKILL_LEVEL_LABELS } from '@/types/enums';

import { toBatchFormValues } from '../utils/toBatchInput';

type BatchFormProps = {
  /** `null` creates a new batch. */
  batch: Batch | null;
  venues: Venue[];
  isSaving: boolean;
  error?: unknown;
  submitLabel: string;
  onSubmit: (values: BatchFormValues) => Promise<void>;
};

export function BatchForm({
  batch,
  venues,
  isSaving,
  error,
  submitLabel,
  onSubmit,
}: BatchFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BatchFormValues>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: toBatchFormValues(batch),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <CardBody className="grid gap-4 sm:grid-cols-2">
        <FormField label="Batch name" error={errors.name?.message} className="sm:col-span-2">
          {(field) => (
            <Input
              {...field}
              {...register('name')}
              placeholder="Morning U16"
              hasError={Boolean(errors.name)}
            />
          )}
        </FormField>

        <FormField label="Age group" hint="U12, U16, Senior…" error={errors.ageGroup?.message}>
          {(field) => <Input {...field} {...register('ageGroup')} />}
        </FormField>

        <FormField label="Skill level" error={errors.skillLevel?.message}>
          {(field) => (
            <Select {...field} {...register('skillLevel')}>
              <option value="">Any</option>
              {SKILL_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {SKILL_LEVEL_LABELS[level]}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <FormField label="Venue" error={errors.venueId?.message}>
          {(field) => (
            <Select {...field} {...register('venueId')} disabled={venues.length === 0}>
              <option value="">{venues.length === 0 ? 'No venues yet' : 'Not set'}</option>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <FormField
          label="Capacity"
          hint="Blocks assignment once full."
          error={errors.capacity?.message}
        >
          {(field) => <Input {...field} {...register('capacity')} inputMode="numeric" />}
        </FormField>

        <FormField
          label="Monthly fee (₹)"
          hint="Leave blank to use the academy default."
          error={errors.monthlyFeeRupees?.message}
        >
          {(field) => <Input {...field} {...register('monthlyFeeRupees')} inputMode="numeric" />}
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Starts" error={errors.startDate?.message}>
            {(field) => <Input {...field} {...register('startDate')} type="date" />}
          </FormField>
          <FormField label="Ends" error={errors.endDate?.message}>
            {(field) => <Input {...field} {...register('endDate')} type="date" />}
          </FormField>
        </div>

        <FormField
          label="Description"
          className="sm:col-span-2"
          error={errors.description?.message}
        >
          {(field) => <Textarea {...field} {...register('description')} rows={3} />}
        </FormField>

        {error ? (
          <p role="alert" className="text-danger text-sm sm:col-span-2">
            {errorMessage(error)}
          </p>
        ) : null}
      </CardBody>

      <CardFooter>
        <Button type="submit" isLoading={isSaving}>
          {submitLabel}
        </Button>
      </CardFooter>
    </form>
  );
}
