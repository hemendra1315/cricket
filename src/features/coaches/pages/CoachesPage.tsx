import { Link } from 'react-router-dom';

import { EmptyState, ErrorState } from '@/components/feedback';
import {
  Avatar,
  Badge,
  Card,
  CardBody,
  CardHeader,
  SkeletonText,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
} from '@/components/ui';
import { useActiveAcademy } from '@/features/academies';

import { useCoaches } from '../hooks/useCoaches';

/** Coaching staff of the active academy; readable by every member. */
export default function CoachesPage() {
  const { academyId } = useActiveAcademy();
  const query = useCoaches(academyId);

  return (
    <div className="space-y-4">
      <h1 className="text-fg text-xl font-semibold">Coaches</h1>

      <Card>
        <CardHeader
          title="Coaching staff"
          description="Promote a member to coach on the Members page."
        />
        <CardBody>
          {query.isPending ? (
            <SkeletonText lines={3} />
          ) : query.isError ? (
            <ErrorState error={query.error} onRetry={() => void query.refetch()} />
          ) : query.data.length === 0 ? (
            <EmptyState
              title="No coaches yet"
              description="Share the coach join code, then approve the request."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Coach</TH>
                  <TH>Specialisation</TH>
                  <TH>Experience</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {query.data.map((coach) => (
                  <TR key={coach.id}>
                    <TD>
                      <Link to={`/coaches/${coach.id}`} className="flex items-center gap-2">
                        <Avatar
                          name={coach.fullName ?? coach.email ?? 'Coach'}
                          src={coach.avatarUrl}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="text-fg truncate text-sm font-medium">
                            {coach.fullName ?? 'Unnamed coach'}
                          </p>
                          <p className="text-fg-muted truncate text-xs">{coach.email}</p>
                        </div>
                      </Link>
                    </TD>
                    <TD className="text-fg-muted text-sm">
                      {coach.specialization.length > 0 ? coach.specialization.join(', ') : '—'}
                    </TD>
                    <TD className="text-fg-muted text-sm">
                      {coach.experienceYears === null ? '—' : `${coach.experienceYears} yrs`}
                    </TD>
                    <TD>
                      <Badge tone={coach.isActive ? 'success' : 'neutral'}>
                        {coach.isActive ? 'active' : 'inactive'}
                      </Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
