import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, RefreshCw, AlertCircle } from 'lucide-react';

import { Button, Card, CardBody, CardHeader } from '@/components/ui';
import { ErrorState, EmptyState } from '@/components/feedback';
import { useActiveAcademy } from '@/features/academies';
import { useCan } from '@/lib/rbac';
import { useUiStore } from '@/stores';
import { useBatchPlayers } from '@/features/batches';
import { useSessionAttendance, useMarkAttendance, useMarkAllPresent } from '../hooks/useAttendance';
import { useOfflineAttendanceQueue } from '../lib/offlineAttendanceQueue';
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

  const { queuedItems, queuedByPlayer, queueAttendance, queueAllPresent, triggerSync, isSyncing } =
    useOfflineAttendanceQueue(sessionId ?? null, academyId ?? null);

  const session = sessionQuery.data;
  const batchPlayersQuery = useBatchPlayers(session?.batchId ?? null, academyId);

  const attendanceByPlayer = useMemo(() => {
    const map = new Map<string, string>();
    // First fill from server/cache data
    if (attendanceQuery.data) {
      for (const record of attendanceQuery.data) {
        map.set(record.playerId, record.status);
      }
    }
    // Then overlay queued offline items (which take precedence)
    for (const [playerId, item] of queuedByPlayer.entries()) {
      map.set(playerId, item.status);
    }
    return map;
  }, [attendanceQuery.data, queuedByPlayer]);

  const handleMark = async (playerId: string, status: AttendanceStatus) => {
    if (!academyId || !sessionId) return;

    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

    if (isOffline) {
      await queueAttendance(playerId, status);
      pushToast({
        title: 'Saved offline in queue',
        description: 'Attendance queued locally. Will sync when connectivity returns.',
        variant: 'info',
      });
      return;
    }

    try {
      await markAttendance.mutateAsync({ sessionId, playerId, status });
      pushToast({ title: 'Attendance updated', variant: 'success' });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const isNetworkErr =
        errMsg.includes('Failed to fetch') ||
        errMsg.includes('NetworkError') ||
        errMsg.includes('offline');

      if (isNetworkErr) {
        await queueAttendance(playerId, status);
        pushToast({
          title: 'Saved offline (connection lost)',
          description: 'Network interrupted. Queued locally to sync automatically.',
          variant: 'info',
        });
      } else {
        pushToast({
          title: 'Failed to update attendance',
          description: errMsg,
          variant: 'error',
        });
      }
    }
  };

  const handleMarkAllPresent = async () => {
    if (!academyId || !sessionId || !batchPlayersQuery.data?.length) return;
    const playerIds = batchPlayersQuery.data.map((player) => player.academyMemberId);
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

    if (isOffline) {
      await queueAllPresent(playerIds);
      pushToast({
        title: 'All players marked present offline',
        description: 'Queued locally in IndexedDB. Will sync when connectivity returns.',
        variant: 'info',
      });
      return;
    }

    try {
      await markAllPresent.mutateAsync({ sessionId, playerIds });
      pushToast({ title: 'All players marked present', variant: 'success' });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const isNetworkErr =
        errMsg.includes('Failed to fetch') ||
        errMsg.includes('NetworkError') ||
        errMsg.includes('offline');

      if (isNetworkErr) {
        await queueAllPresent(playerIds);
        pushToast({
          title: 'All players marked present offline (connection lost)',
          description: 'Queued locally in IndexedDB.',
          variant: 'info',
        });
      } else {
        pushToast({
          title: 'Failed to update attendance',
          description: errMsg,
          variant: 'error',
        });
      }
    }
  };

  const presentCount = useMemo(() => {
    let count = 0;
    if (batchPlayersQuery.data) {
      for (const p of batchPlayersQuery.data) {
        if (attendanceByPlayer.get(p.academyMemberId) === 'present') {
          count++;
        }
      }
    }
    return count;
  }, [batchPlayersQuery.data, attendanceByPlayer]);

  const totalPlayers = batchPlayersQuery.data?.length ?? 0;

  if (!academyId || !sessionId) {
    return (
      <EmptyState title="No session selected" description="Select a session to mark attendance." />
    );
  }

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

      {/* Offline Queue Session Banner */}
      {queuedItems.length > 0 && (
        <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 sm:flex-row sm:items-center dark:text-amber-200">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/20 p-2 text-amber-600 dark:text-amber-300">
              <Clock className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                {queuedItems.length === 1
                  ? '1 attendance update queued offline'
                  : `${queuedItems.length} attendance updates queued offline`}
              </p>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                Stored safely in IndexedDB on this device. Syncs automatically when online.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void triggerSync()}
            isLoading={isSyncing}
            className="border-amber-500/30 text-xs font-semibold hover:bg-amber-500/20"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Sync Now
          </Button>
        </div>
      )}

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
                const queuedItem = queuedByPlayer.get(player.academyMemberId);
                const isPlayerSaving =
                  markAttendance.isPending &&
                  markAttendance.variables?.playerId === player.academyMemberId;

                return (
                  <div
                    key={player.id}
                    className="border-border-subtle bg-surface flex flex-col justify-between gap-3 rounded-2xl border p-4 shadow-2xs sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-fg text-base font-semibold">
                          {player.fullName ?? player.email}
                        </p>
                        {queuedItem && queuedItem.statusState === 'queued' && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                            <Clock className="h-3 w-3 animate-pulse" />
                            Queued (Offline)
                          </span>
                        )}
                        {queuedItem && queuedItem.statusState === 'error' && (
                          <span
                            className="border-danger/20 bg-danger/10 text-danger inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold"
                            title={queuedItem.errorReason}
                          >
                            <AlertCircle className="h-3 w-3" />
                            Sync Error
                          </span>
                        )}
                      </div>
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
                              await handleMark(player.academyMemberId, option.value);
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
