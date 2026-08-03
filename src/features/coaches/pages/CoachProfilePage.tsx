import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { EmptyState, ErrorState } from '@/components/feedback';
import { FormField } from '@/components/form';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  SkeletonText,
  Textarea,
} from '@/components/ui';
import { useActiveAcademy } from '@/features/academies';
import { errorMessage } from '@/lib/api';
import { useCan } from '@/lib/rbac';
import { coachProfileFormSchema, type CoachProfileFormValues } from '@/lib/validators';
import { useAuthStore, useUiStore } from '@/stores';
import type { Coach } from '@/types';
import { COACH_SPECIALIZATIONS } from '@/types/enums';

import { useCoach, useMyCoach, useUpdateCoach } from '../hooks/useCoaches';

/** One coach. `/coaches/me` resolves the signed-in coach's own row. */
export default function CoachProfilePage() {
  const { coachId } = useParams<{ coachId: string }>();
  const isSelf = coachId === 'me';
  const { academyId } = useActiveAcademy();

  const staffQuery = useCoach(isSelf ? null : academyId, coachId);
  const selfQuery = useMyCoach(isSelf ? academyId : null);
  const coach = isSelf ? selfQuery.coach : (staffQuery.data ?? null);
  const query = isSelf ? selfQuery : staffQuery;

  if (query.isPending) return <SkeletonText lines={5} />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  if (!coach) {
    return (
      <EmptyState
        title="No coach profile"
        description="You are not registered as a coach in this academy."
      />
    );
  }

  return <CoachProfile coach={coach} academyId={academyId ?? ''} />;
}

function CoachProfile({ coach, academyId }: { coach: Coach; academyId: string }) {
  const userId = useAuthStore((state) => state.user?.id);
  const canManage = useCan('coaches:manage');
  // The `coaches_update` policy allows an owner or the coach themselves.
  const canEdit = canManage || coach.userId === userId;
  const updateCoach = useUpdateCoach(academyId);
  const pushToast = useUiStore((state) => state.pushToast);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CoachProfileFormValues>({
    resolver: zodResolver(coachProfileFormSchema),
    values: {
      bio: coach.bio ?? '',
      experienceYears: coach.experienceYears === null ? '' : String(coach.experienceYears),
      specialization: coach.specialization,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await updateCoach.mutateAsync({
      coachId: coach.id,
      input: {
        bio: values.bio?.trim() ? values.bio.trim() : null,
        experienceYears: values.experienceYears === '' ? null : Number(values.experienceYears),
        specialization: values.specialization,
      },
    });
    pushToast({ title: 'Coach profile saved', variant: 'success' });
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="flex flex-wrap items-center gap-3">
          <Avatar name={coach.fullName ?? coach.email ?? 'Coach'} src={coach.avatarUrl} size="lg" />
          <div className="min-w-0">
            <h1 className="text-fg text-lg font-semibold">{coach.fullName ?? 'Unnamed coach'}</h1>
            <p className="text-fg-muted text-sm">{coach.email}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge tone={coach.isActive ? 'success' : 'neutral'}>
              {coach.isActive ? 'active' : 'inactive'}
            </Badge>
            {canManage ? (
              <Button
                variant="secondary"
                size="sm"
                isLoading={updateCoach.isPending}
                onClick={() =>
                  updateCoach.mutate({ coachId: coach.id, input: { isActive: !coach.isActive } })
                }
              >
                {coach.isActive ? 'Deactivate' : 'Reactivate'}
              </Button>
            ) : null}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Coaching profile"
          description={canEdit ? 'Shown to players in this academy.' : 'Read-only.'}
        />
        {canEdit ? (
          <form onSubmit={onSubmit} noValidate>
            <CardBody className="space-y-4">
              <FormField label="Years of experience" error={errors.experienceYears?.message}>
                {(field) => (
                  <Input {...field} {...register('experienceYears')} inputMode="numeric" />
                )}
              </FormField>

              <fieldset className="space-y-1.5">
                <legend className="text-fg text-sm font-medium">Specialisation</legend>
                <div className="flex flex-wrap gap-3">
                  {COACH_SPECIALIZATIONS.map((item) => (
                    <label key={item} className="text-fg-muted flex items-center gap-1.5 text-sm">
                      <input type="checkbox" value={item} {...register('specialization')} />
                      {item}
                    </label>
                  ))}
                </div>
              </fieldset>

              <FormField label="About" error={errors.bio?.message}>
                {(field) => <Textarea {...field} {...register('bio')} rows={4} />}
              </FormField>

              {updateCoach.isError ? (
                <p role="alert" className="text-danger text-sm">
                  {errorMessage(updateCoach.error)}
                </p>
              ) : null}
            </CardBody>
            <CardFooter>
              <Button type="submit" isLoading={updateCoach.isPending} disabled={!isDirty}>
                Save changes
              </Button>
            </CardFooter>
          </form>
        ) : (
          <CardBody className="space-y-2">
            <p className="text-fg text-sm">{coach.bio ?? 'No profile written yet.'}</p>
            <p className="text-fg-muted text-xs">
              {coach.specialization.length > 0
                ? coach.specialization.join(', ')
                : 'No specialisation listed'}
              {coach.experienceYears === null ? '' : ` · ${coach.experienceYears} years`}
            </p>
          </CardBody>
        )}
      </Card>
    </div>
  );
}
