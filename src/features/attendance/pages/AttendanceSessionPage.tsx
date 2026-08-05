import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button, Card, CardBody, CardFooter, CardHeader } from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { useActiveAcademy } from '@/features/academies';
import { useCan } from '@/lib/rbac';
import { useUiStore } from '@/stores';
import { useBatchPlayers } from '@/features/batches';
import { useSessionAttendance, useMarkAttendance, useMarkAllPresent } from '../hooks/useAttendance';
import { useTrainingSession } from '@/features/sessions';
import type { AttendanceStatus } from '@/types/enums';
import { formatDate, formatTime } from '@/lib/utils/date';

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
  const playerNameById = useMemo(() => {
    const map = new Map<string, string>();
    batchPlayersQuery.data?.forEach((player) => {
      map.set(player.academyMemberId, player.fullName ?? player.email);
    });
    return map;
  }, [batchPlayersQuery.data]);

  if (!academyId || !sessionId) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-fg text-xl font-semibold">Attendance</h1>
          <p className="text-fg-muted">Mark attendance for this training session.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void navigate('/sessions')}>
          Back to sessions
        </Button>
      </div>

      {sessionQuery.isPending ? (
        <p className="text-fg-muted">Loading session…</p>
      ) : sessionQuery.isError ? (
        <ErrorState error={sessionQuery.error} onRetry={() => void sessionQuery.refetch()} />
      ) : !session ? (
        <ErrorState error={new Error('Session not found')} />
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader
              title={session.title}
              description={`${formatDate(session.sessionDate)} · ${formatTime(session.startAt)} - ${formatTime(session.endAt)}`}
            />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-fg-muted text-xs tracking-wide uppercase">Batch</p>
                <p className="text-fg text-base font-medium">{session.batch.name}</p>
              </div>
              <div>
                <p className="text-fg-muted text-xs tracking-wide uppercase">Coach</p>
                <p className="text-fg text-base font-medium">
                  {session.coach.fullName ?? session.coach.email}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Players"
              description="Mark each player present or absent."
              action={
                canManage && totalPlayers > 0 ? (
                  <Button
                    size="sm"
                    isLoading={markAllPresent.isPending}
                    onClick={() => void handleMarkAllPresent()}
                  >
                    Mark all present
                  </Button>
                ) : null
              }
            />
            <CardBody className="space-y-3">
              {totalPlayers > 0 ? (
                <div className="bg-surface-muted text-fg-muted rounded-lg px-4 py-2 text-sm">
                  Present: <span className="text-fg font-semibold">{presentCount}</span> /{' '}
                  {totalPlayers} players
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
                    const currentStatus =
                      attendanceByPlayer.get(player.academyMemberId) ?? 'absent';
                    return (
                      <div
                        key={player.id}
                        className="border-border-subtle grid gap-3 rounded-2xl border p-4 sm:grid-cols-[1fr_auto]"
                      >
                        <div>
                          <p className="text-fg font-medium">{player.fullName ?? player.email}</p>
                          <p className="text-fg-muted text-sm">{player.email}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {ATTENDANCE_OPTIONS.map((option) => (
                            <Button
                              key={option.value}
                              size="sm"
                              variant={currentStatus === option.value ? 'primary' : 'secondary'}
                              onClick={() => void handleMark(player.academyMemberId, option.value)}
                              isLoading={markAttendance.isPending}
                              disabled={!canManage}
                            >
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Session attendance"
              description="Recent attendance records for this session."
            />
            <CardBody>
              {attendanceQuery.data?.length ? (
                <div className="space-y-2">
                  {attendanceQuery.data.map((record) => (
                    <div key={record.id} className="border-border-subtle rounded-2xl border p-3">
                      <p className="text-fg text-sm">
                        {playerNameById.get(record.playerId) ?? record.playerId}
                      </p>
                      <p className="text-fg-muted text-xs">Status: {record.status}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-fg-muted">No attendance records yet.</p>
              )}
            </CardBody>
            <CardFooter>
              <p className="text-fg-muted text-sm">Only coaches and owners can mark attendance.</p>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
