import { useState } from 'react';
import { Navigate } from 'react-router-dom';

import { Button, Card, CardBody } from '@/components/ui';
import { errorMessage } from '@/lib/api';
import { env } from '@/lib/env';

import { useAuth } from '../hooks/useAuth';

/** Google Sign-In entry point. No business logic beyond starting the OAuth flow. */
export default function SignInPage() {
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSignIn = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await login();
    } catch (cause) {
      setError(errorMessage(cause));
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardBody className="space-y-6 text-center">
        <div>
          <h1 className="text-fg text-xl font-semibold">{env.appName}</h1>
          <p className="text-fg-muted mt-1 text-sm">Sign in to manage your academy.</p>
        </div>

        <Button className="w-full" size="lg" isLoading={isSubmitting} onClick={onSignIn}>
          Continue with Google
        </Button>

        {error ? (
          <p role="alert" className="text-danger text-sm">
            {error}
          </p>
        ) : null}

        <p className="text-fg-muted text-xs">
          By continuing you agree to the academy&apos;s terms of use.
        </p>
      </CardBody>
    </Card>
  );
}
