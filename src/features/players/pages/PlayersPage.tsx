import { useState } from 'react';
import { Link } from 'react-router-dom';

import { EmptyState, ErrorState } from '@/components/feedback';
import {
  Avatar,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SkeletonText,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
} from '@/components/ui';
import { useActiveAcademy } from '@/features/academies';
import { useCan } from '@/lib/rbac';
import type { Player } from '@/types';
import {
  PLAYER_ROLE_LABELS,
  SKILL_LEVELS,
  SKILL_LEVEL_LABELS,
  type SkillLevel,
} from '@/types/enums';

import { usePlayers } from '../hooks/usePlayers';

/** Player roster for staff: search, filter and open a profile. */
export default function PlayersPage() {
  const { academyId } = useActiveAcademy();
  const canManage = useCan('players:manage');
  const [search, setSearch] = useState('');
  const [skillLevel, setSkillLevel] = useState<'all' | SkillLevel>('all');
  const [activeOnly, setActiveOnly] = useState(true);

  const query = usePlayers(academyId, {
    search,
    activeOnly,
    ...(skillLevel === 'all' ? {} : { skillLevel }),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-fg text-xl font-semibold">Players</h1>

      <Card>
        <CardHeader
          title="Roster"
          description={
            canManage
              ? 'Approve join requests on the Members page to add players.'
              : 'Players training at this academy.'
          }
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Input
                aria-label="Search players"
                className="h-8 w-44"
                placeholder="Search name or code"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <Select
                aria-label="Filter by skill level"
                className="h-8 w-40"
                value={skillLevel}
                onChange={(event) => setSkillLevel(event.target.value as 'all' | SkillLevel)}
              >
                <option value="all">All skill levels</option>
                {SKILL_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {SKILL_LEVEL_LABELS[level]}
                  </option>
                ))}
              </Select>
              <label className="text-fg-muted flex items-center gap-1.5 text-xs">
                <input
                  type="checkbox"
                  checked={activeOnly}
                  onChange={(event) => setActiveOnly(event.target.checked)}
                />
                Active only
              </label>
            </div>
          }
        />
        <CardBody>
          {query.isPending ? (
            <SkeletonText lines={4} />
          ) : query.isError ? (
            <ErrorState error={query.error} onRetry={() => void query.refetch()} />
          ) : query.data.length === 0 ? (
            <EmptyState
              title="No players yet"
              description="Players appear here once their join request is approved."
            />
          ) : (
            <PlayerTable players={query.data} />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function PlayerTable({ players }: { players: Player[] }) {
  return (
    <Table>
      <THead>
        <TR>
          <TH>Player</TH>
          <TH>Code</TH>
          <TH>Role</TH>
          <TH>Skill</TH>
          <TH>Status</TH>
        </TR>
      </THead>
      <TBody>
        {players.map((player) => (
          <TR key={player.id}>
            <TD>
              <Link to={`/players/${player.id}`} className="flex items-center gap-2">
                <Avatar
                  name={player.fullName ?? player.email ?? 'Player'}
                  src={player.avatarUrl}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-fg truncate text-sm font-medium">
                    {player.fullName ?? 'Unnamed player'}
                  </p>
                  <p className="text-fg-muted truncate text-xs">{player.email ?? 'No login'}</p>
                </div>
              </Link>
            </TD>
            <TD className="text-fg-muted text-sm">{player.playerCode ?? '—'}</TD>
            <TD className="text-fg-muted text-sm">
              {player.playerRole ? PLAYER_ROLE_LABELS[player.playerRole] : '—'}
            </TD>
            <TD className="text-fg-muted text-sm">{SKILL_LEVEL_LABELS[player.skillLevel]}</TD>
            <TD>
              <Badge tone={player.isActive ? 'success' : 'neutral'}>
                {player.isActive ? 'active' : 'inactive'}
              </Badge>
            </TD>
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
