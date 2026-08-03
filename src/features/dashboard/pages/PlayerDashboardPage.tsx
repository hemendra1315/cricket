import { Link } from 'react-router-dom';

import { EmptyState } from '@/components/feedback';
import { buttonStyles, Card, CardBody, CardFooter, CardHeader } from '@/components/ui';

/** Placeholder shell — schedule, attendance %, feedback and dues arrive later. */
export default function PlayerDashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-fg text-xl font-semibold">My dashboard</h1>
      <Card>
        <CardHeader
          title="Your training"
          description="Schedule, attendance and feedback appear here."
        />
        <CardBody>
          <EmptyState
            title="Not enrolled yet"
            description="Join an academy with a code to get started."
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="My player profile"
          description="Batting and bowling style, jersey number and guardian contact."
        />
        <CardFooter>
          <Link to="/players/me" className={buttonStyles('secondary', 'sm')}>
            Open my profile
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
