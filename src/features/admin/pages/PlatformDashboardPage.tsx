import { EmptyState } from '@/components/feedback';
import { Card, CardBody, CardHeader } from '@/components/ui';

/** Super-admin placeholder — platform metrics arrive in Phase 9. */
export default function PlatformDashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-fg text-xl font-semibold">Platform administration</h1>
      <Card>
        <CardHeader title="Academies" description="Plans, MRR and job health arrive in Phase 9." />
        <CardBody>
          <EmptyState title="No academies yet" />
        </CardBody>
      </Card>
    </div>
  );
}
