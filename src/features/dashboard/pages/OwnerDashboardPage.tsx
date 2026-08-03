import { EmptyState } from '@/components/feedback';
import { Card, CardBody, CardHeader } from '@/components/ui';

/** Placeholder shell — widgets are built in Phase 9. */
export default function OwnerDashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-fg text-xl font-semibold">Owner dashboard</h1>
      <Card>
        <CardHeader
          title="Academy overview"
          description="Attendance, approvals and dues land in Phase 9."
        />
        <CardBody>
          <EmptyState
            title="No data yet"
            description="Create batches and sessions to populate this dashboard."
          />
        </CardBody>
      </Card>
    </div>
  );
}
