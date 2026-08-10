import { useState } from 'react';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { Button, Card, CardBody, CardFooter, CardHeader, Input, Select } from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/feedback';
import { useActiveAcademy } from '@/features/academies';
import { useCan } from '@/lib/rbac';
import { useUiStore } from '@/stores';
import { useAcademyMatches, useCreateMatch, useDeleteMatch } from '../hooks/useMatches';
import { useBatches } from '@/features/batches';
import { formatDate } from '@/lib/utils/date';
import { Link } from 'react-router-dom';
import type { MatchFormat, MatchType } from '@/types/enums';

type MatchFormValues = {
  matchName: string;
  matchDate: string;
  opponentName: string;
  tournament: string;
  matchType: MatchType;
  format: MatchFormat;
  overs: string;
  batchId: string;
};

const DEFAULT_MATCH_FORM: MatchFormValues = {
  matchName: '',
  matchDate: '',
  opponentName: '',
  tournament: '',
  matchType: 'friendly',
  format: 't20',
  overs: '',
  batchId: '',
};

const MATCH_FORMATS = [
  { value: 't20', label: 'T20' },
  { value: 'odi', label: 'ODI' },
  { value: 'test', label: 'Test' },
  { value: 't10', label: 'T10' },
  { value: 'custom', label: 'Custom' },
];

const MATCH_TYPES = [
  { value: 'practice', label: 'Practice' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'league', label: 'League' },
  { value: 'tournament', label: 'Tournament' },
];

export default function MatchesPage() {
  const { academyId } = useActiveAcademy();
  const canManage = useCan('matches:manage');

  const matchesQuery = useAcademyMatches(academyId);
  const batchesQuery = useBatches(academyId);
  const createMatch = useCreateMatch(academyId as string);
  const deleteMatch = useDeleteMatch(academyId as string);

  const pushToast = useUiStore((state) => state.pushToast);

  const [showForm, setShowForm] = useState(false);
  const [matchDate, setMatchDate] = useState<Date | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm<MatchFormValues>({
    defaultValues: DEFAULT_MATCH_FORM,
  });

  const handleCreate = handleSubmit(async (value) => {
    await createMatch.mutateAsync({
      academyId: academyId as string,
      matchName: value.matchName,
      matchDate: matchDate?.toISOString().split('T')[0] || value.matchDate,
      opponentName: value.opponentName || null,
      tournament: value.tournament || null,
      matchType: value.matchType,
      format: value.format,
      overs: value.overs ? parseFloat(value.overs) : null,
      batchId: value.batchId || null,
    });

    pushToast({
      title: 'Match created',
      variant: 'success',
    });

    reset(DEFAULT_MATCH_FORM);
    setMatchDate(null);
    setShowForm(false);
  });

  const handleDelete = async (matchId: string) => {
    await deleteMatch.mutateAsync({ matchId });

    pushToast({
      title: 'Match deleted',
      variant: 'success',
    });
  };

  if (!academyId) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-fg text-xl font-semibold">Matches</h1>
          <p className="text-fg-muted">Create and manage your academy matches.</p>
        </div>

        {canManage ? (
          <Button onClick={() => setShowForm((open) => !open)}>
            {showForm ? 'Hide form' : 'New match'}
          </Button>
        ) : null}
      </div>

      {showForm && canManage ? (
        <Card>
          <form onSubmit={handleCreate} noValidate>
            <CardHeader title="Create match" description="Set up a new match with basic details." />

            <CardBody className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-fg block text-sm font-medium">Match name</label>
                  <Input
                    {...register('matchName', {
                      required: 'Match name is required',
                    })}
                  />
                </div>

                <div>
                  <label className="text-fg block text-sm font-medium">Match date</label>
                  <DatePicker
                    selected={matchDate}
                    onChange={(date: Date | null) => setMatchDate(date)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select date"
                    className="w-full rounded-lg border px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-fg block text-sm font-medium">Opponent name</label>
                  <Input {...register('opponentName')} />
                </div>

                <div>
                  <label className="text-fg block text-sm font-medium">Tournament</label>
                  <Input {...register('tournament')} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-fg block text-sm font-medium">Match type</label>
                  <Select {...register('matchType')}>
                    {MATCH_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="text-fg block text-sm font-medium">Format</label>
                  <Select {...register('format')}>
                    {MATCH_FORMATS.map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-fg block text-sm font-medium">Overs</label>
                  <Input type="number" step="0.1" {...register('overs')} />
                </div>

                <div>
                  <label className="text-fg block text-sm font-medium">Batch</label>
                  <Select {...register('batchId')}>
                    <option value="">No batch (optional)</option>
                    {batchesQuery.data?.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </CardBody>

            <CardFooter>
              <Button type="submit" isLoading={createMatch.isPending} disabled={!isDirty}>
                Create match
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : null}

      <Card>
        <CardHeader title="All matches" description="See every match in this academy." />

        <CardBody>
          {matchesQuery.isPending ? (
            <p className="text-fg-muted">Loading matches…</p>
          ) : matchesQuery.isError ? (
            <ErrorState error={matchesQuery.error} onRetry={() => void matchesQuery.refetch()} />
          ) : matchesQuery.data?.length === 0 ? (
            <EmptyState
              title="No matches yet"
              description="Create a match to start tracking results."
            />
          ) : (
            <div className="space-y-3">
              {matchesQuery.data.map((match) => (
                <Link
                  key={match.id}
                  to={`/matches/${match.id}`}
                  className="border-border-subtle hover:border-primary/40 block rounded-2xl border p-4 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-fg text-lg font-semibold hover:underline">
                        {match.matchName}
                      </p>

                      <p className="text-fg-muted text-sm">
                        {formatDate(match.matchDate)}
                        {match.opponentName ? ` · vs ${match.opponentName}` : ''}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-surface-muted text-fg-muted rounded-full px-3 py-1 text-xs font-medium">
                        {match.matchType}
                      </span>

                      <span className="bg-surface-muted text-fg-muted rounded-full px-3 py-1 text-xs font-medium">
                        {match.format.toUpperCase()}
                      </span>

                      <span className="bg-surface-muted text-fg-muted rounded-full px-3 py-1 text-xs font-medium">
                        {match.status}
                      </span>
                    </div>
                  </div>

                  {canManage ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="danger"
                        size="sm"
                        isLoading={deleteMatch.isPending}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          void handleDelete(match.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  ) : null}
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
