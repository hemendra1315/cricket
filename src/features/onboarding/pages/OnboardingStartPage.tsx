import { Building2, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';

import { buttonStyles, Card, CardBody } from '@/components/ui';
import { useAuth } from '@/features/auth';

/** First screen for a signed-in user with no academy: create one or join one. */
export default function OnboardingStartPage() {
  const { displayName } = useAuth();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-fg text-2xl font-semibold">
          Welcome{displayName ? `, ${displayName.split(' ')[0]}` : ''}
        </h1>
        <p className="text-fg-muted text-sm">
          You are not part of an academy yet. Start one, or join an existing academy with its code.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardBody className="flex h-full flex-col gap-3">
            <Building2 className="text-primary h-6 w-6" aria-hidden />
            <div className="flex-1">
              <h2 className="text-fg font-medium">I run an academy</h2>
              <p className="text-fg-muted mt-1 text-sm">
                Create your academy, invite coaches and players, and manage everything from one
                dashboard.
              </p>
            </div>
            <Link to="/onboarding/create-academy" className={buttonStyles()}>
              Create an academy
            </Link>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex h-full flex-col gap-3">
            <Ticket className="text-primary h-6 w-6" aria-hidden />
            <div className="flex-1">
              <h2 className="text-fg font-medium">I have a join code</h2>
              <p className="text-fg-muted mt-1 text-sm">
                Enter the code your academy shared. The owner approves your request before you get
                access.
              </p>
            </div>
            <Link to="/onboarding/join-academy" className={buttonStyles('secondary')}>
              Join with a code
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
