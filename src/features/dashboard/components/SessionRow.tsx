import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

import type { TrainingSession } from '@/features/sessions/api/sessionsTypes';
import { formatDate, formatTime } from '@/lib/utils/date';

type SessionRowProps = {
  session: TrainingSession;
  /** Optional secondary action rendered after the session details. */
  action?: ReactNode;
};

/**
 * Compact, clickable row used by the role dashboards to surface a single
 * upcoming session. Mirrors the list style in TrainingSessionsPage.
 */
export function SessionRow({ session, action }: SessionRowProps) {
  return (
    <Link
      to={`/sessions/${session.id}`}
      className="border-border-subtle hover:border-primary/40 block rounded-2xl border p-4 transition"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-fg text-lg font-semibold">{session.title}</p>
          <p className="text-fg-muted text-sm">{session.batch.name}</p>
        </div>
        <span className="text-fg-muted text-sm capitalize">{session.status}</span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div>
          <p className="text-fg-muted text-xs tracking-wide uppercase">Date</p>
          <p className="text-fg text-sm">{formatDate(session.sessionDate)}</p>
        </div>
        <div>
          <p className="text-fg-muted text-xs tracking-wide uppercase">Time</p>
          <p className="text-fg text-sm">
            {formatTime(session.startAt)} – {formatTime(session.endAt)}
          </p>
        </div>
        <div>
          <p className="text-fg-muted text-xs tracking-wide uppercase">Coach</p>
          <p className="text-fg text-sm">{session.coach.fullName ?? session.coach.email}</p>
        </div>
      </div>
      {action ? <div className="mt-3">{action}</div> : null}
    </Link>
  );
}
