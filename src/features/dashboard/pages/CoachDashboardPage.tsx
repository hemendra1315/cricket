import { EmptyState } from '@/components/feedback';
import { Card, CardBody, CardHeader } from '@/components/ui';

/** Placeholder shell — today's sessions and quick attendance arrive in Phase 4. */
export default function CoachDashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-fg text-xl font-semibold">Coach dashboard</h1>
      <Card>
        <CardHeader
          title="Today"
          description="Sessions and quick attendance marking arrive in Phase 4."
        />
        <CardBody>
          <EmptyState title="Nothing scheduled" description="You have no sessions assigned yet." />
        </CardBody>
      </Card>
    </div>
  );
}
