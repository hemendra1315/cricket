import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button, Card, CardBody, CardHeader } from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { useActiveAcademy } from '@/features/academies';
import { useCan } from '@/lib/rbac';
import { useUiStore } from '@/stores';
import { useBatchPlayers } from '@/features/batches';
import { useSessionAttendance, useMarkAttendance, useMarkAllPresent } from '../hooks/useAttendance';
import { useTrainingSession } from '@/features/sessions';
import type { AttendanceStatus } from '@/types/enums';
import { formatDate, formatTime } from '@/lib/utils/date';
import { MobilePageHeader } from '@/components/mobile';

const ATTENDANCE_OPTIONS: Array<{ value: AttendanceStatus; label: string }> = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
];

export default function AttendanceSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { academyId } = useActiveAcademy();
  const canManage = useCan('attendance:mark');
  const sessionQuery = useTrainingSession(sessionId ?? null, academyId);
  const attendanceQuery = useSessionAttendance(sessionId ?? null, academyId);
  const markAttendance = useMarkAttendance(academyId as string);
  const markAllPresent = useMarkAllPresent(academyId as string);
  const pushToast = useUiStore((state) => state.pushToast);

  const session = sessionQuery.data;
  const batchPlayersQuery = useBatchPlayers(session?.batchId ?? null, academyId);

  const attendanceByPlayer = useMemo(() => {
    if (!attendanceQuery.data) return new Map<string, string>();
    return new Map(attendanceQuery.data.map((record) => [record.playerId, record.status]));
  }, [attendanceQuery.data]);

  const handleMark = async (playerId: string, status: AttendanceStatus) => {
    if (!academyId || !sessionId) return;
    await markAttendance.mutateAsync({ sessionId, playerId, status });
    pushToast({ title: 'Attendance updated', variant: 'success' });
  };

  const handleMarkAllPresent = async () => {
    if (!academyId || !sessionId || !batchPlayersQuery.data?.length) return;
    const playerIds = batchPlayersQuery.data.map((player) => player.academyMemberId);
    await markAllPresent.mutateAsync({ sessionId, playerIds });
    pushToast({ title: 'All players marked present', variant: 'success' });
  };

  const presentCount =
    attendanceQuery.data?.filter((record) => record.status === 'present').length ?? 0;
  const totalPlayers = batchPlayersQuery.data?.length ?? 0;

  if (!academyId || !sessionId) return null;

  return (
    <div className="space-y-4 pb-24 md:pb-6">
      {/* Mobile Header */}
      <div className="md:hidden">
        <MobilePageHeader
          title={session?.title ?? 'Mark Attendance'}
          subtitle={
            session
              ? `${formatDate(session.sessionDate)} • ${formatTime(session.startAt)}`
              : 'Session Roster'
          }
          showBack
        />
      </div>

      <div className="hidden flex-wrap items-center justify-between gap-3 md:flex">
        <div>
          <h1 className="text-fg text-xl font-semibold">
            {session ? session.title : 'Mark attendance'}
          </h1>
          {session ? (
            <p className="text-fg-muted">
              {formatDate(session.sessionDate)} • {formatTime(session.startAt)} –{' '}
              {formatTime(session.endAt)}
              {session.batch?.name ? ` • Batch: ${session.batch?.name}` : ''}
            </p>
          ) : null}
        </div>
        <Button variant="secondary" onClick={() => navigate('/sessions')}>
          Back to sessions
        </Button>
      </div>

      <Card>
        <CardHeader
          title="Roster Attendance"
          description="Toggle player attendance for this session."
          className="hidden md:block"
        />
        <CardBody className="space-y-4 p-4">
          {totalPlayers > 0 ? (
            <div className="bg-surface-muted/70 border-border-subtle text-fg-muted flex items-center justify-between rounded-xl border p-3 text-xs sm:text-sm">
              <span>
                Present: <strong className="text-primary font-bold">{presentCount}</strong> /{' '}
                {totalPlayers} players
              </span>
              {canManage && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => void handleMarkAllPresent()}
                  isLoading={markAllPresent.isPending}
                  className="min-h-[36px] text-xs font-semibold"
                >
                  Mark All Present
                </Button>
              )}
            </div>
          ) : null}

          {batchPlayersQuery.isPending || attendanceQuery.isPending ? (
            <p className="text-fg-muted">Loading players…</p>
          ) : batchPlayersQuery.isError ? (
            <ErrorState
              error={batchPlayersQuery.error}
              onRetry={() => void batchPlayersQuery.refetch()}
            />
          ) : attendanceQuery.isError ? (
            <ErrorState
              error={attendanceQuery.error}
              onRetry={() => void attendanceQuery.refetch()}
            />
          ) : !batchPlayersQuery.data?.length ? (
            <p className="text-fg-muted">No players assigned to this batch.</p>
          ) : (
            <div className="space-y-3">
              {batchPlayersQuery.data.map((player) => {
                const currentStatus = attendanceByPlayer.get(player.academyMemberId) ?? 'absent';
                const isPlayerSaving =
                  markAttendance.isPending &&
                  markAttendance.variables?.playerId === player.academyMemberId;

                return (
                  <div
                    key={player.id}
                    className="border-border-subtle bg-surface flex flex-col justify-between gap-3 rounded-2xl border p-4 shadow-2xs sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="text-fg text-base font-semibold">
                        {player.fullName ?? player.email}
                      </p>
                      <p className="text-fg-muted text-xs">{player.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {ATTENDANCE_OPTIONS.map((option) => {
                        const isSelected = currentStatus === option.value;
                        return (
                          <Button
                            key={option.value}
                            variant={isSelected ? 'primary' : 'secondary'}
                            onClick={async () => {
                              if (isSelected || isPlayerSaving) return;
                              try {
                                await handleMark(player.academyMemberId, option.value);
                              } catch (err) {
                                pushToast({
                                  title: 'Failed to update attendance',
                                  description: err instanceof Error ? err.message : 'Unknown error',
                                  variant: 'error',
                                });
                              }
                            }}
                            isLoading={isPlayerSaving}
                            className={`min-h-[48px] flex-1 px-5 text-sm font-semibold sm:flex-initial ${
                              isSelected
                                ? option.value === 'present'
                                  ? 'bg-success border-success hover:bg-success/90 text-white'
                                  : 'bg-danger border-danger hover:bg-danger/90 text-white'
                                : ''
                            }`}
                          >
                            {option.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
