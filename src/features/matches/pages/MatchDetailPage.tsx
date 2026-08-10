import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';

import { Card, CardBody, CardHeader } from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { useActiveAcademy } from '@/features/academies';
import {
  useMatch,
  useMatchLineups,
  useMatchBatting,
  useMatchBowling,
  useMatchFielding,
  useMatchAwards,
} from '../hooks/useMatches';

export default function MatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const { academyId } = useActiveAcademy();

  const matchQuery = useMatch(matchId ?? null, academyId);
  const lineupsQuery = useMatchLineups(matchId ?? null);
  const battingQuery = useMatchBatting(matchId ?? null);
  const bowlingQuery = useMatchBowling(matchId ?? null);
  const fieldingQuery = useMatchFielding(matchId ?? null);
  const awardsQuery = useMatchAwards(matchId ?? null);

  const matchTypeLabel = matchQuery.data?.matchType;
  const formatLabel = matchQuery.data?.format;

  const captain = useMemo(() => lineupsQuery.data?.find((l) => l.isCaptain), [lineupsQuery.data]);
  const viceCaptain = useMemo(
    () => lineupsQuery.data?.find((l) => l.isViceCaptain),
    [lineupsQuery.data],
  );
  const wicketkeeper = useMemo(
    () => lineupsQuery.data?.find((l) => l.isWicketkeeper),
    [lineupsQuery.data],
  );

  if (!matchId) return null;
  if (matchQuery.isPending) return <p className="text-fg-muted">Loading match…</p>;
  if (matchQuery.isError || !matchQuery.data)
    return <ErrorState error={matchQuery.error} onRetry={() => void matchQuery.refetch()} />;

  const match = matchQuery.data;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/matches" className="text-fg-muted hover:text-fg text-sm">
          ← Back to matches
        </Link>
      </div>

      <Card>
        <CardHeader
          title={match.matchName}
          description={`${new Date(match.matchDate).toLocaleDateString()} • ${match.opponentName ?? 'No opponent'} • ${match.tournament ?? ''}`.trim()}
        />
        <CardBody>
          <div className="flex flex-wrap gap-3">
            <span className="bg-surface-muted text-fg-muted rounded-full px-3 py-1 text-xs font-medium">
              {matchTypeLabel}
            </span>
            <span className="bg-surface-muted text-fg-muted rounded-full px-3 py-1 text-xs font-medium">
              {formatLabel?.toUpperCase()}
            </span>
            <span className="bg-surface-muted text-fg-muted rounded-full px-3 py-1 text-xs font-medium">
              {match.status}
            </span>
            {match.overs ? (
              <span className="bg-surface-muted text-fg-muted rounded-full px-3 py-1 text-xs font-medium">
                {match.overs} overs
              </span>
            ) : null}
            {match.teamScore ? (
              <span className="bg-surface-muted text-fg-muted rounded-full px-3 py-1 text-xs font-medium">
                {match.teamScore}
              </span>
            ) : null}
          </div>

          {captain ? (
            <p className="text-fg-muted mt-2 text-sm">
              Captain: {captain.player.fullName ?? captain.player.email}
            </p>
          ) : null}
          {viceCaptain ? (
            <p className="text-fg-muted text-sm">
              Vice Captain: {viceCaptain.player.fullName ?? viceCaptain.player.email}
            </p>
          ) : null}
          {wicketkeeper ? (
            <p className="text-fg-muted text-sm">
              Wicketkeeper: {wicketkeeper.player.fullName ?? wicketkeeper.player.email}
            </p>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Batting" description="Batting scorecard." />
        <CardBody>
          {battingQuery.isPending ? (
            <p className="text-fg-muted">Loading batting…</p>
          ) : battingQuery.data?.length === 0 ? (
            <p className="text-fg-muted">No batting data.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2">Player</th>
                    <th className="pb-2">R</th>
                    <th className="pb-2">B</th>
                    <th className="pb-2">4s</th>
                    <th className="pb-2">6s</th>
                    <th className="pb-2">Dismissal</th>
                  </tr>
                </thead>
                <tbody>
                  {battingQuery.data?.map((b) => (
                    <tr key={b.id} className="border-b last:border-0">
                      <td className="py-2">{b.player.fullName ?? b.player.email}</td>
                      <td className="py-2">{b.runs}</td>
                      <td className="py-2">{b.balls}</td>
                      <td className="py-2">{b.fours}</td>
                      <td className="py-2">{b.sixes}</td>
                      <td className="py-2">{b.isOut ? (b.dismissalType ?? 'Out') : 'Not out'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Bowling" description="Bowling scorecard." />
        <CardBody>
          {bowlingQuery.isPending ? (
            <p className="text-fg-muted">Loading bowling…</p>
          ) : bowlingQuery.data?.length === 0 ? (
            <p className="text-fg-muted">No bowling data.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2">Player</th>
                    <th className="pb-2">Overs</th>
                    <th className="pb-2">Maidens</th>
                    <th className="pb-2">Runs</th>
                    <th className="pb-2">Wickets</th>
                    <th className="pb-2">Wides</th>
                    <th className="pb-2">No-balls</th>
                  </tr>
                </thead>
                <tbody>
                  {bowlingQuery.data?.map((b) => (
                    <tr key={b.id} className="border-b last:border-0">
                      <td className="py-2">{b.player.fullName ?? b.player.email}</td>
                      <td className="py-2">{b.overs}</td>
                      <td className="py-2">{b.maidens}</td>
                      <td className="py-2">{b.runsConceded}</td>
                      <td className="py-2">{b.wickets}</td>
                      <td className="py-2">{b.wides}</td>
                      <td className="py-2">{b.noBalls}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Fielding" description="Fielding stats." />
        <CardBody>
          {fieldingQuery.isPending ? (
            <p className="text-fg-muted">Loading fielding…</p>
          ) : fieldingQuery.data?.length === 0 ? (
            <p className="text-fg-muted">No fielding data.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2">Player</th>
                    <th className="pb-2">Catches</th>
                    <th className="pb-2">Run-outs</th>
                    <th className="pb-2">Stumpings</th>
                  </tr>
                </thead>
                <tbody>
                  {fieldingQuery.data?.map((f) => (
                    <tr key={f.id} className="border-b last:border-0">
                      <td className="py-2">{f.player.fullName ?? f.player.email}</td>
                      <td className="py-2">{f.catches}</td>
                      <td className="py-2">{f.runOuts}</td>
                      <td className="py-2">{f.stumpings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Awards" description="Match awards." />
        <CardBody>
          {awardsQuery.isPending ? (
            <p className="text-fg-muted">Loading awards…</p>
          ) : !awardsQuery.data ? (
            <p className="text-fg-muted">No awards recorded.</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-fg-muted text-xs">Player of the Match</p>
                <p className="text-fg font-medium">
                  {awardsQuery.data.playerOfMatch?.fullName ??
                    awardsQuery.data.playerOfMatch?.email ??
                    '-'}
                </p>
              </div>
              <div>
                <p className="text-fg-muted text-xs">Best Batter</p>
                <p className="text-fg font-medium">
                  {awardsQuery.data.bestBatter?.fullName ??
                    awardsQuery.data.bestBatter?.email ??
                    '-'}
                </p>
              </div>
              <div>
                <p className="text-fg-muted text-xs">Best Bowler</p>
                <p className="text-fg font-medium">
                  {awardsQuery.data.bestBowler?.fullName ??
                    awardsQuery.data.bestBowler?.email ??
                    '-'}
                </p>
              </div>
              <div>
                <p className="text-fg-muted text-xs">Best Fielder</p>
                <p className="text-fg font-medium">
                  {awardsQuery.data.bestFielder?.fullName ??
                    awardsQuery.data.bestFielder?.email ??
                    '-'}
                </p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
