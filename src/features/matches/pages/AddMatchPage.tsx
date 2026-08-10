import { useNavigate } from 'react-router-dom';
import { useActiveAcademy } from '@/features/academies';
import { MatchWizard } from '../components/wizard';

export default function AddMatchPage() {
  const { academyId } = useActiveAcademy();
  const navigate = useNavigate();

  if (!academyId) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-fg text-2xl font-bold">New Match Entry</h1>
        <p className="text-fg-muted text-sm">
          Enter match details, lineups, scorecards, and optional awards.
        </p>
      </div>

      <MatchWizard
        academyId={academyId}
        onComplete={(matchId) => {
          navigate(`/matches/${matchId}`);
        }}
      />
    </div>
  );
}
