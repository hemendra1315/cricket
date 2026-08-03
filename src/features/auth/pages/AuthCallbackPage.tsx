import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { LoadingScreen } from '@/components/feedback';

import { useAuth } from '../hooks/useAuth';

/**
 * OAuth landing route. supabase-js consumes the URL fragment itself
 * (detectSessionInUrl), so this page only waits for the resulting state.
 */
export default function AuthCallbackPage() {
  const { status } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'authenticated') navigate('/', { replace: true });
    if (status === 'unauthenticated') navigate('/sign-in', { replace: true });
  }, [status, navigate]);

  return <LoadingScreen message="Completing sign-in…" />;
}
