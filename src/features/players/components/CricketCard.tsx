import { useState } from 'react';
import { Button, Badge } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { useActiveAcademy } from '@/features/academies';
import { EditCricketProfileModal } from './EditCricketProfileModal';
import type { PlayerProfile, PlayerStatistics } from '../api/playersTypes';

interface CricketCardProps {
  profile: PlayerProfile;
  stats: PlayerStatistics | null;
}

export function CricketCard({ profile, stats }: CricketCardProps) {
  const { user } = useAuth();
  const { membership } = useActiveAcademy();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Can edit if they are the player, OR if they are an academy owner/admin
  const canEdit = (user && user.id === profile.userId) || membership?.role === 'academy_owner';

  const dismissals = stats ? stats.battingInnings - stats.battingNotOuts : 0;
  const battingAverage =
    stats && stats.battingInnings > 0
      ? dismissals > 0
        ? (stats.battingRuns / dismissals).toFixed(2)
        : stats.battingRuns.toFixed(2)
      : '0.00';

  const strikeRate =
    stats && stats.ballsFacedSum > 0
      ? ((stats.battingRuns / stats.ballsFacedSum) * 100).toFixed(2)
      : '0.00';

  const bowlingAverage =
    stats && stats.bowlingWickets > 0
      ? (stats.bowlingRunsConceded / stats.bowlingWickets).toFixed(2)
      : '0.00';

  const economy =
    stats && stats.bowlingOvers > 0
      ? (stats.bowlingRunsConceded / stats.bowlingOvers).toFixed(2)
      : '0.00';

  return (
    <>
      <div className="bg-surface border-border-subtle overflow-hidden rounded-2xl border shadow-sm">
        {/* HEADER SECTION */}
        <div className="bg-surface-muted border-border-subtle relative border-b p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="border-surface relative h-24 w-24 shrink-0 rounded-full border-4 bg-white shadow-2xs sm:h-32 sm:w-32">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName || 'Player'}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="bg-surface-muted flex h-full w-full items-center justify-center rounded-full">
                  <span className="text-fg-muted text-3xl font-bold">
                    {profile.fullName?.[0] ?? '?'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col items-center text-center sm:items-start sm:text-left">
              <div className="flex w-full flex-col justify-between sm:flex-row sm:items-start">
                <div>
                  <h1 className="text-fg text-2xl font-bold sm:text-3xl">
                    {profile.fullName ?? 'Unknown Player'}
                  </h1>
                  <div className="mt-1 flex items-center justify-center gap-2 sm:justify-start">
                    {profile.academyLogoUrl && (
                      <img
                        src={profile.academyLogoUrl}
                        alt=""
                        className="h-5 w-5 rounded-full object-cover"
                      />
                    )}
                    <p className="text-fg-muted font-medium">{profile.academyName}</p>
                  </div>
                </div>

                {canEdit && (
                  <div className="mt-4 sm:mt-0">
                    <Button variant="secondary" size="sm" onClick={() => setIsEditModalOpen(true)}>
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Badge tone="brand">
                  {profile.playerRole?.replace('_', ' ').toUpperCase() || 'PLAYER'}
                </Badge>
                {profile.jerseyNumber && <Badge tone="neutral">No. {profile.jerseyNumber}</Badge>}
                {profile.batchName && <Badge tone="neutral">{profile.batchName}</Badge>}
                {profile.playerCode && <Badge tone="neutral">ID: {profile.playerCode}</Badge>}
              </div>
            </div>
          </div>
        </div>

        {/* CRICKET PROFILE & BIO */}
        <div className="grid gap-6 p-6 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <h3 className="text-fg-muted text-xs font-semibold tracking-wider uppercase">
              Player Bio
            </h3>
            <p className="text-fg mt-2 text-sm leading-relaxed whitespace-pre-wrap">
              {profile.bio || 'No bio provided yet.'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-fg-muted text-xs font-semibold tracking-wider uppercase">
                Batting Style
              </h3>
              <p className="text-fg mt-1 font-medium capitalize">
                {profile.battingStyle?.replace('_', ' ') || '--'}
              </p>
            </div>
            <div>
              <h3 className="text-fg-muted text-xs font-semibold tracking-wider uppercase">
                Bowling Style
              </h3>
              <p className="text-fg mt-1 font-medium capitalize">
                {profile.bowlingStyle?.replace('_', ' ') || '--'}
              </p>
            </div>
          </div>
        </div>

        {/* STATISTICS */}
        <div className="bg-surface-muted border-border-subtle grid grid-cols-2 gap-px border-t sm:grid-cols-4">
          <StatBox label="Matches" value={stats?.matchesPlayed.toString() ?? '--'} />
          <StatBox label="Runs" value={stats?.battingRuns.toString() ?? '--'} />
          <StatBox label="Wickets" value={stats?.bowlingWickets.toString() ?? '--'} />
          <StatBox label="Catches" value={stats?.fieldingCatches.toString() ?? '--'} />
          <StatBox label="Batting Avg" value={stats ? battingAverage : '--'} />
          <StatBox label="Strike Rate" value={stats ? strikeRate : '--'} />
          <StatBox
            label="Bowling Avg"
            value={stats && stats.bowlingWickets > 0 ? bowlingAverage : '--'}
          />
          <StatBox label="Economy" value={stats && stats.bowlingOvers > 0 ? economy : '--'} />
        </div>
      </div>

      <EditCricketProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
      />
    </>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface flex flex-col items-center justify-center p-4 text-center">
      <span className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">{label}</span>
      <span className="text-fg mt-1 text-xl font-bold">{value}</span>
    </div>
  );
}
