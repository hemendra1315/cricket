import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { EmptyState, ErrorState } from '@/components/feedback';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  SkeletonText,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
} from '@/components/ui';
import { useActiveAcademy } from '@/features/academies';
import { useCan } from '@/lib/rbac';
import { useUiStore } from '@/stores';
import type { Batch } from '@/types';
import { SKILL_LEVEL_LABELS } from '@/types/enums';

import { BatchForm } from '../components/BatchForm';
import { useBatches, useCreateBatch, useVenues } from '../hooks/useBatches';
import { toBatchInput } from '../utils/toBatchInput';

/** Batch list for the whole academy; owners can also create one from here. */
export default function BatchesPage() {
  const { academyId } = useActiveAcademy();
  const canManage = useCan('batches:manage');
  const [activeOnly, setActiveOnly] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const query = useBatches(academyId, activeOnly);

  return (
    <div className="space-y-4">
      <h1 className="text-fg text-xl font-semibold">Batches</h1>

      <Card>
        <CardHeader
          title="Training batches"
          description="A batch groups players with their coaches, venue and monthly fee."
          action={
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-fg-muted flex items-center gap-1.5 text-xs">
                <input
                  type="checkbox"
                  checked={activeOnly}
                  onChange={(event) => setActiveOnly(event.target.checked)}
                />
                Active only
              </label>
              {canManage ? (
                <Button size="sm" onClick={() => setIsCreating(true)}>
                  New batch
                </Button>
              ) : null}
            </div>
          }
        />
        <CardBody>
          {query.isPending ? (
            <SkeletonText lines={4} />
          ) : query.isError ? (
            <ErrorState error={query.error} onRetry={() => void query.refetch()} />
          ) : query.data.length === 0 ? (
            <EmptyState
              title="No batches yet"
              description={
                canManage
                  ? 'Create a batch, then assign coaches and players to it.'
                  : 'Your academy has not set up any batches yet.'
              }
            />
          ) : (
            <BatchTable batches={query.data} />
          )}
        </CardBody>
      </Card>

      {isCreating && academyId ? (
        <CreateBatchModal academyId={academyId} onClose={() => setIsCreating(false)} />
      ) : null}
    </div>
  );
}

function BatchTable({ batches }: { batches: Batch[] }) {
  return (
    <Table>
      <THead>
        <TR>
          <TH>Batch</TH>
          <TH>Age group</TH>
          <TH>Skill</TH>
          <TH>Venue</TH>
          <TH>Players</TH>
          <TH>Coaches</TH>
          <TH>Status</TH>
        </TR>
      </THead>
      <TBody>
        {batches.map((batch) => (
          <TR key={batch.id}>
            <TD>
              <Link to={`/batches/${batch.id}`} className="text-fg text-sm font-medium">
                {batch.name}
              </Link>
            </TD>
            <TD className="text-fg-muted text-sm">{batch.ageGroup ?? '—'}</TD>
            <TD className="text-fg-muted text-sm">
              {batch.skillLevel ? SKILL_LEVEL_LABELS[batch.skillLevel] : 'Any'}
            </TD>
            <TD className="text-fg-muted text-sm">{batch.venueName ?? '—'}</TD>
            <TD className="text-fg-muted text-sm">
              {batch.capacity === null
                ? batch.playerCount
                : `${batch.playerCount} / ${batch.capacity}`}
            </TD>
            <TD className="text-fg-muted text-sm">{batch.coachCount}</TD>
            <TD>
              <Badge tone={batch.isActive ? 'success' : 'neutral'}>
                {batch.isActive ? 'active' : 'inactive'}
              </Badge>
            </TD>
          </TR>
        ))}
      </TBody>
    </Table>
  );
}

function CreateBatchModal({ academyId, onClose }: { academyId: string; onClose: () => void }) {
  const navigate = useNavigate();
  const venues = useVenues(academyId);
  const createBatch = useCreateBatch(academyId);
  const pushToast = useUiStore((state) => state.pushToast);

  return (
    <Modal open title="New batch" size="lg" onClose={onClose}>
      <BatchForm
        batch={null}
        venues={venues.data ?? []}
        isSaving={createBatch.isPending}
        error={createBatch.error}
        submitLabel="Create batch"
        onSubmit={async (values) => {
          const batchId = await createBatch.mutateAsync(toBatchInput(values));
          pushToast({ title: `${values.name} created`, variant: 'success' });
          onClose();
          navigate(`/batches/${batchId}`);
        }}
      />
    </Modal>
  );
}
