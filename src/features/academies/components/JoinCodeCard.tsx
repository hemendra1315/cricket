import { Copy, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { ErrorState } from '@/components/feedback';
import { Button, Card, CardBody, CardHeader, Skeleton } from '@/components/ui';
import { Can } from '@/lib/rbac';
import { useUiStore } from '@/stores';
import type { UUID } from '@/types';
import type { JoinableRole } from '@/types/enums';

import { useJoinCode, useRegenerateJoinCode } from '../hooks/useAcademies';

/**
 * Shows the academy's shareable join code. Owners can rotate it, which
 * immediately deactivates the previous code server-side.
 */
export function JoinCodeCard({
  academyId,
  role = 'player',
}: {
  academyId: UUID;
  role?: JoinableRole;
}) {
  const { data: code, isPending, isError, error, refetch } = useJoinCode(academyId, role);
  const regenerate = useRegenerateJoinCode(academyId, role);
  const pushToast = useUiStore((state) => state.pushToast);
  const [prevCode, setPrevCode] = useState(code);
  const [copied, setCopied] = useState(false);

  if (code !== prevCode) {
    setPrevCode(code);
    setCopied(false);
  }

  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      pushToast({ title: 'Could not copy', description: code, variant: 'warning' });
    }
  };

  return (
    <Card>
      <CardHeader
        title={role === 'coach' ? 'Coach join code' : 'Player join code'}
        description="Share this code so people can request to join. You approve every request."
      />
      <CardBody className="flex flex-wrap items-center gap-3">
        {isError ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : isPending ? (
          <Skeleton className="h-9 w-32" />
        ) : (
          <>
            <code className="bg-surface-muted text-fg rounded-lg px-4 py-2 text-lg font-semibold tracking-[0.3em]">
              {code ?? '—'}
            </code>
            <Button variant="secondary" size="sm" onClick={() => void copy()} disabled={!code}>
              <Copy className="h-4 w-4" aria-hidden />
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Can do="academy:regenerate_join_code">
              <Button
                variant="ghost"
                size="sm"
                isLoading={regenerate.isPending}
                onClick={() => regenerate.mutate()}
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                Regenerate
              </Button>
            </Can>
          </>
        )}
      </CardBody>
    </Card>
  );
}
