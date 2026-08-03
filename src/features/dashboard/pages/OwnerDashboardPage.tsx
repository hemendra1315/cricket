import { Link } from 'react-router-dom';

import { EmptyState } from '@/components/feedback';
import { buttonStyles, Card, CardBody, CardHeader } from '@/components/ui';
import { JoinCodeCard, useActiveAcademy } from '@/features/academies';
import { useAcademyMembers } from '@/features/members';
import { ROLE_LABELS } from '@/types/enums';

/** Owner home. Attendance/dues widgets arrive in Phase 9. */
export default function OwnerDashboardPage() {
  const { academyId, membership } = useActiveAcademy();
  const members = useAcademyMembers(academyId);

  const counts = {
    coaches: members.data?.filter((member) => member.role === 'coach').length ?? 0,
    players: members.data?.filter((member) => member.role === 'player').length ?? 0,
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-fg text-xl font-semibold">{membership?.academyName}</h1>
        <p className="text-fg-muted text-sm">
          {membership ? ROLE_LABELS[membership.role] : ''}
          {membership?.city ? ` · ${membership.city}` : ''}
        </p>
      </div>

      {academyId ? <JoinCodeCard academyId={academyId} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader title="Coaches" />
          <CardBody className="text-fg text-3xl font-semibold">{counts.coaches}</CardBody>
        </Card>
        <Card>
          <CardHeader title="Players" />
          <CardBody className="text-fg text-3xl font-semibold">{counts.players}</CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Academy overview"
          description="Attendance, approvals and dues land in Phase 9."
        />
        <CardBody>
          <EmptyState
            title="No training data yet"
            description="Batches and sessions arrive in the next phases."
            action={
              <Link to="/members" className={buttonStyles('secondary', 'sm')}>
                Manage members
              </Link>
            }
          />
        </CardBody>
      </Card>
    </div>
  );
}
