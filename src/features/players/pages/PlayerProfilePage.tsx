import { useParams } from 'react-router-dom';

import { EmptyState, ErrorState } from '@/components/feedback';
import { Avatar, Badge, Button, Card, CardBody, CardHeader, SkeletonText } from '@/components/ui';
import { useActiveAcademy } from '@/features/academies';
import { useCan } from '@/lib/rbac';
import { formatDate } from '@/lib/utils/date';
import type { PlayerProfileFormValues } from '@/lib/validators';
import { useUiStore } from '@/stores';
import type { Player } from '@/types';
import { BATTING_STYLE_LABELS, PLAYER_ROLE_LABELS, SKILL_LEVEL_LABELS } from '@/types/enums';

import { PlayerForm } from '../components/PlayerForm';
import {
  useMyPlayer,
  usePlayer,
  useUpdateMyPlayerProfile,
  useUpdatePlayer,
} from '../hooks/usePlayers';
import { toPlayerInput } from '../utils/toPlayerInput';

/**
 * One player. `/players/me` resolves the signed-in player's own row; any other
 * id is the staff view, which can also edit academy-controlled fields.
 */
export default function PlayerProfilePage() {
  const { playerId } = useParams<{ playerId: string }>();
  const isSelf = playerId === 'me';
  const { academyId } = useActiveAcademy();
  const canManage = useCan('players:manage');

  const staffQuery = usePlayer(isSelf ? null : academyId, playerId);
  const selfQuery = useMyPlayer(isSelf ? academyId : null);
  const query = isSelf ? selfQuery : staffQuery;

  if (query.isPending) return <SkeletonText lines={6} />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  if (!query.data) {
    return (
      <EmptyState
        title="No player profile"
        description="You are not registered as a player in this academy."
      />
    );
  }

  return (
    <PlayerProfile
      player={query.data}
      academyId={academyId ?? ''}
      canManage={canManage && !isSelf}
      isSelf={isSelf}
    />
  );
}

/** Coaches read the roster but never write to it. */
function PlayerDetails({ player }: { player: Player }) {
  const rows: [string, string][] = [
    ['Player code', player.playerCode ?? '—'],
    ['Date of birth', player.dateOfBirth ? formatDate(player.dateOfBirth) : '—'],
    ['Playing role', player.playerRole ? PLAYER_ROLE_LABELS[player.playerRole] : '—'],
    ['Batting', player.battingStyle ? BATTING_STYLE_LABELS[player.battingStyle] : '—'],
    ['Bowling', player.bowlingStyle ?? '—'],
    ['Jersey number', player.jerseyNumber === null ? '—' : String(player.jerseyNumber)],
    ['Guardian', player.guardianName ?? '—'],
    ['Guardian mobile', player.guardianPhone ?? '—'],
  ];

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-fg-muted text-xs">{label}</dt>
          <dd className="text-fg text-sm">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function PlayerProfile({
  player,
  academyId,
  canManage,
  isSelf,
}: {
  player: Player;
  academyId: string;
  canManage: boolean;
  isSelf: boolean;
}) {
  const pushToast = useUiStore((state) => state.pushToast);
  const updatePlayer = useUpdatePlayer(academyId);
  const updateSelf = useUpdateMyPlayerProfile(academyId);
  const saving = isSelf ? updateSelf : updatePlayer;

  const onSubmit = async (values: PlayerProfileFormValues) => {
    const input = toPlayerInput(values);
    if (isSelf) {
      const { playerCode: _code, skillLevel: _skill, medicalNotes: _notes, ...selfInput } = input;
      await updateSelf.mutateAsync(selfInput);
    } else {
      await updatePlayer.mutateAsync({ playerId: player.id, input });
    }
    pushToast({ title: 'Player profile saved', variant: 'success' });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="flex flex-wrap items-center gap-3">
          <Avatar
            name={player.fullName ?? player.email ?? 'Player'}
            src={player.avatarUrl}
            size="lg"
          />
          <div className="min-w-0">
            <h1 className="text-fg text-lg font-semibold">{player.fullName ?? 'Unnamed player'}</h1>
            <p className="text-fg-muted text-sm">{player.email ?? 'No login linked'}</p>
            <p className="text-fg-muted text-xs">
              {SKILL_LEVEL_LABELS[player.skillLevel]} · joined {formatDate(player.joinedOn)}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge tone={player.isActive ? 'success' : 'neutral'}>
              {player.isActive ? 'active' : 'inactive'}
            </Badge>
            {canManage ? (
              <Button
                variant="secondary"
                size="sm"
                isLoading={updatePlayer.isPending}
                onClick={() =>
                  updatePlayer.mutate({
                    playerId: player.id,
                    input: { isActive: !player.isActive },
                  })
                }
              >
                {player.isActive ? 'Deactivate' : 'Reactivate'}
              </Button>
            ) : null}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Cricket profile"
          description={
            canManage
              ? 'Academy-controlled fields are editable here.'
              : isSelf
                ? 'You can keep your own details up to date.'
                : 'Read-only: only the academy owner can edit a player.'
          }
        />
        {canManage || isSelf ? (
          <PlayerForm
            player={player}
            canManage={canManage}
            isSaving={saving.isPending}
            error={saving.error}
            onSubmit={onSubmit}
          />
        ) : (
          <CardBody>
            <PlayerDetails player={player} />
          </CardBody>
        )}
      </Card>
    </div>
  );
}
