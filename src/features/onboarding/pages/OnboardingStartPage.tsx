import { Card, CardBody, CardHeader } from '@/components/ui';

/**
 * Placeholder for the Phase 2 onboarding flow (join with code / create academy /
 * pending approval). Routing and layout are wired now; logic comes later.
 */
export default function OnboardingStartPage() {
  return (
    <Card>
      <CardHeader
        title="Join or create an academy"
        description="The join-code flow and owner approval are implemented in Phase 2."
      />
      <CardBody>
        <p className="text-fg-muted text-sm">
          You are signed in but not a member of any academy yet.
        </p>
      </CardBody>
    </Card>
  );
}
