import { useState } from 'react';
import { Button } from '@/components/ui';
import type { ExtractedMatchData } from '../../import/cricheroesPdfTypes';

export function TeamSelectStep({
  data,
  onConfirm,
  onBack,
}: {
  data: ExtractedMatchData;
  onConfirm: (academyTeamName: string, opponentName: string) => void;
  onBack: () => void;
}) {
  const [selectedAcademyTeam, setSelectedAcademyTeam] = useState<string>(data.teamA.name);

  const opponentName = selectedAcademyTeam === data.teamA.name ? data.teamB.name : data.teamA.name;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-fg text-lg font-semibold">Select Your Academy Team</h3>
        <p className="text-fg-muted text-sm">
          Which of the two teams in the CricHeroes scorecard belongs to your academy?
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setSelectedAcademyTeam(data.teamA.name)}
          className={`rounded-xl border p-5 text-left transition ${
            selectedAcademyTeam === data.teamA.name
              ? 'border-primary bg-primary/10'
              : 'border-border-subtle hover:border-primary/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-fg font-bold">{data.teamA.name}</span>
            <span className="text-fg-muted text-xs font-semibold">{data.teamA.score}</span>
          </div>
          <p className="text-fg-muted mt-2 text-xs">Click to select as Academy Team</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedAcademyTeam(data.teamB.name)}
          className={`rounded-xl border p-5 text-left transition ${
            selectedAcademyTeam === data.teamB.name
              ? 'border-primary bg-primary/10'
              : 'border-border-subtle hover:border-primary/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-fg font-bold">{data.teamB.name}</span>
            <span className="text-fg-muted text-xs font-semibold">{data.teamB.score}</span>
          </div>
          <p className="text-fg-muted mt-2 text-xs">Click to select as Academy Team</p>
        </button>
      </div>

      <div className="bg-surface-subtle border-border-subtle rounded-xl border p-4 text-sm">
        <p className="text-fg font-medium">Selected Configuration:</p>
        <p className="text-fg-muted mt-1">
          <strong>Academy Team:</strong> {selectedAcademyTeam}
        </p>
        <p className="text-fg-muted">
          <strong>Opponent:</strong> {opponentName}
        </p>
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <Button type="button" onClick={() => onConfirm(selectedAcademyTeam, opponentName)}>
          Next: Player Mapping →
        </Button>
      </div>
    </div>
  );
}
