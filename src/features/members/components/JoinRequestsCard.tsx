import { EmptyState, ErrorState } from '@/components/feedback';
import { Avatar, Badge, Button, Card, CardBody, CardHeader, SkeletonText } from '@/components/ui';
import { errorMessage } from '@/lib/api';
import { formatDate } from '@/lib/utils/date';
import { useUiStore } from '@/stores';
import type { UUID } from '@/types';
import { ROLE_LABELS } from '@/types/enums';

import { useJoinRequests, useReviewJoinRequest } from '../hooks/useJoinRequests';

/**
 * Owner approval queue. Approving creates the membership and the player/coach
 * profile in one transaction, so the roster updates immediately.
 */
export function JoinRequestsCard({ academyId }: { academyId: UUID }) {
  const query = useJoinRequests(academyId);
  const { approve, reject } = useReviewJoinRequest(academyId);
  const pushToast = useUiStore((state) => state.pushToast);
  const isBusy = approve.isPending || reject.isPending;
  const error = approve.error ?? reject.error;

  return (
    <Card>
      <CardHeader
        title="Join requests"
        description="People who used your join code and are waiting for approval."
        action={
          query.data && query.data.length > 0 ? (
            <Badge tone="warning">{query.data.length} waiting</Badge>
          ) : null
        }
      />
      <CardBody className="space-y-2">
        {query.isPending ? (
          <SkeletonText lines={2} />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        ) : query.data.length === 0 ? (
          <EmptyState title="Nothing to review" description="New requests will appear here." />
        ) : (
          query.data.map((request) => (
            <div
              key={request.id}
              className="border-border-subtle flex flex-wrap items-center gap-3 rounded-lg border p-3"
            >
              <Avatar name={request.fullName ?? request.email} src={request.avatarUrl} size="sm" />
              <div className="min-w-0">
                <p className="text-fg truncate text-sm font-medium">
                  {request.fullName ?? request.email}
                </p>
                <p className="text-fg-muted truncate text-xs">
                  {ROLE_LABELS[request.requestedRole]} · asked {formatDate(request.createdAt)}
                </p>
                {request.message ? (
                  <p className="text-fg-muted mt-1 text-xs italic">“{request.message}”</p>
                ) : null}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  size="sm"
                  disabled={isBusy}
                  onClick={() =>
                    approve.mutate(request.id, {
                      onSuccess: () =>
                        pushToast({
                          title: `${request.fullName ?? request.email} approved`,
                          variant: 'success',
                        }),
                    })
                  }
                >
                  Approve
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => reject.mutate({ requestId: request.id })}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))
        )}

        {error ? (
          <p role="alert" className="text-danger text-sm">
            {errorMessage(error)}
          </p>
        ) : null}
      </CardBody>
    </Card>
  );
}
