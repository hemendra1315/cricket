import { EmptyState } from '@/components/feedback';
import { Card, CardBody, CardHeader } from '@/components/ui';
import { useAcademyStore } from '@/stores';
import { useAcademyMembers } from '@/features/members';
import { useActiveAcademy } from '@/features/academies';
import { usePlayerAttendance } from '@/features/attendance/hooks/useAttendance';
import { usePlayerDrillAssignments } from '@/features/drills/hooks/useDrills';

export default function PlayerDashboardPage() {
  const academyId = useAcademyStore((state) => state.activeAcademyId);
  const { membership } = useActiveAcademy();
  const playerAttendanceQuery = usePlayerAttendance(membership?.id ?? null, academyId);
  const playerAssignmentsQuery = usePlayerDrillAssignments(membership?.id ?? null, academyId);

  const { data: members = [] } = useAcademyMembers(academyId);

  const isEnrolled = members.some((member) => member.status === 'active');

  const attendancePercent = playerAttendanceQuery.data
    ? Math.round(
        (playerAttendanceQuery.data.filter((record) => record.status === 'present').length /
          Math.max(playerAttendanceQuery.data.length, 1)) *
          100,
      )
    : null;

  const assignments = playerAssignmentsQuery.data ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-fg text-xl font-semibold">My dashboard</h1>

      <Card>
        <CardHeader title="Attendance" description="Your attendance percentage for this academy." />
        <CardBody>
          {playerAttendanceQuery.isPending ? (
            <p className="text-fg-muted">Loading attendance…</p>
          ) : playerAttendanceQuery.isError ? (
            <p className="text-danger">Unable to load attendance.</p>
          ) : attendancePercent !== null ? (
            <div className="space-y-2">
              <p className="text-fg text-2xl font-semibold">{attendancePercent}%</p>
              <p className="text-fg-muted text-sm">
                You have attended{' '}
                {playerAttendanceQuery.data.filter((record) => record.status === 'present').length}{' '}
                of {playerAttendanceQuery.data.length} marked sessions.
              </p>
            </div>
          ) : (
            <p className="text-fg-muted">No attendance records available yet.</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Your training"
          description="Schedule, attendance and feedback appear here."
        />

        <CardBody>
          {isEnrolled ? (
            <div className="space-y-4">
              <p className="text-fg">You are enrolled in the academy.</p>
              {playerAssignmentsQuery.isPending ? (
                <p className="text-fg-muted">Loading assigned drills…</p>
              ) : playerAssignmentsQuery.isError ? (
                <p className="text-danger">Unable to load assigned drills.</p>
              ) : assignments.length === 0 ? (
                <EmptyState
                  title="No training assigned"
                  description="Your coach can assign drills and batches to help improve your game."
                />
              ) : (
                <div className="space-y-3">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="border-border-subtle rounded-2xl border p-4"
                    >
                      <p className="text-fg font-semibold">{assignment.drill.name}</p>
                      <p className="text-fg-muted text-sm">
                        {assignment.batchName
                          ? `Batch: ${assignment.batchName}`
                          : 'Individual assignment'}
                      </p>
                      <div className="text-fg-muted mt-2 flex flex-wrap items-center gap-3 text-sm">
                        <span>Status: {assignment.status}</span>
                        <span>
                          Due:{' '}
                          {assignment.dueDate
                            ? new Date(assignment.dueDate).toLocaleDateString()
                            : 'No due date'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title="Not enrolled yet"
              description="Join an academy with a code to get started."
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
