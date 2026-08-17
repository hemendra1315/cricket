import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Select,
  Textarea,
} from '@/components/ui';
import { EmptyState } from '@/components/feedback';
import { useActiveAcademy } from '@/features/academies';
import { useCan } from '@/lib/rbac';
import { useUiStore } from '@/stores';
import { useDrills, useUpdateDrill } from '../hooks/useDrills';
import type { CreateDrillInput } from '../api/drillsTypes';

export default function DrillDetailPage() {
  const { drillId } = useParams();
  const { academyId } = useActiveAcademy();
  const navigate = useNavigate();
  const canManage = useCan('drills:manage');
  const drillsQuery = useDrills(academyId);
  const updateDrill = useUpdateDrill(academyId as string);
  const pushToast = useUiStore((state) => state.pushToast);

  const drill = drillsQuery.data?.find((item) => item.id === drillId) ?? null;

  const defaultValues: CreateDrillInput = {
    academyId: academyId as string,
    name: drill?.name ?? '',
    category: drill?.category ?? 'batting',
    description: drill?.description ?? null,
    durationMinutes: drill?.durationMinutes ?? null,
    difficulty: drill?.difficulty ?? 'beginner',
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CreateDrillInput>({ defaultValues });

  const handleSave = handleSubmit(async (values) => {
    if (!drill || !academyId || !canManage) return;
    try {
      await updateDrill.mutateAsync({ drillId: drill.id, input: values });
      pushToast({ title: 'Drill updated', variant: 'success' });
      navigate('/drills');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update drill';
      pushToast({ title: 'Update Failed', description: msg, variant: 'error' });
    }
  });

  if (!academyId || !drillId) {
    return (
      <EmptyState
        title="No drill selected"
        description="Select a drill from the drills list to view its details."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-fg text-xl font-semibold">Drill details</h1>
          <p className="text-fg-muted">View or update your drill.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void navigate('/drills')}>
          Back to drills
        </Button>
      </div>

      {!drill ? (
        <EmptyState
          title="Drill not found"
          description="This drill does not exist or you do not have access."
        />
      ) : (
        <Card>
          <form onSubmit={handleSave} noValidate>
            <CardHeader
              title={drill.name}
              description={`${drill.category} · ${drill.difficulty}`}
            />
            <CardBody className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-fg block text-sm font-medium">Title</label>
                  <Input
                    defaultValue={drill.name}
                    {...register('name', { required: 'Title is required' })}
                    hasError={Boolean(errors.name)}
                  />
                  {errors.name ? (
                    <p className="text-danger text-xs">{errors.name.message}</p>
                  ) : null}
                </div>
                <div>
                  <label className="text-fg block text-sm font-medium">Category</label>
                  <Select defaultValue={drill.category} {...register('category')}>
                    <option value="batting">Batting</option>
                    <option value="bowling">Bowling</option>
                    <option value="fielding">Fielding</option>
                    <option value="fitness">Fitness</option>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-fg block text-sm font-medium">Duration (minutes)</label>
                  <Input
                    defaultValue={drill.durationMinutes ?? ''}
                    {...register('durationMinutes', { valueAsNumber: true })}
                    type="number"
                    min={1}
                  />
                </div>
                <div>
                  <label className="text-fg block text-sm font-medium">Difficulty</label>
                  <Select defaultValue={drill.difficulty} {...register('difficulty')}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="elite">Elite</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-fg block text-sm font-medium">Description</label>
                <Textarea
                  defaultValue={drill.description ?? ''}
                  {...register('description')}
                  rows={4}
                />
              </div>
            </CardBody>
            {canManage ? (
              <CardFooter>
                <Button type="submit" isLoading={false} disabled={!isDirty}>
                  Save changes
                </Button>
              </CardFooter>
            ) : null}
          </form>
        </Card>
      )}
    </div>
  );
}
