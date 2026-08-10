import { useState } from 'react';
import { Card, CardBody } from '@/components/ui';
import type { UUID } from '@/types';
import { INITIAL_WIZARD_STATE, WIZARD_STEPS, type WizardState, type WizardStep } from './types';
import { MatchDetailsStep } from './steps/MatchDetailsStep';
import { SelectPlayersStep } from './steps/SelectPlayersStep';
import { BattingOrderStep } from './steps/BattingOrderStep';
import { ScorecardStep } from './steps/ScorecardStep';
import { AwardsStep } from './steps/AwardsStep';
import { ReviewStep } from './steps/ReviewStep';
import { useSaveMatchResult } from '../../hooks/useMatches';
import type { SaveMatchResultPayload } from '../../api/matchesTypes';

export function MatchWizard({
  academyId,
  onComplete,
}: {
  academyId: UUID;
  onComplete: (matchId: UUID) => void;
}) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('details');
  const [state, setState] = useState<WizardState>(INITIAL_WIZARD_STATE);

  const saveMutation = useSaveMatchResult(academyId);

  const stepIndex = WIZARD_STEPS.findIndex((s) => s.id === currentStep);

  function updateState(patch: Partial<WizardState>) {
    setState((prev) => ({ ...prev, ...patch }));
  }

  function nextStep() {
    if (stepIndex >= 0 && stepIndex < WIZARD_STEPS.length - 1) {
      const nextStepObj = WIZARD_STEPS[stepIndex + 1];
      if (nextStepObj) setCurrentStep(nextStepObj.id);
    }
  }

  function prevStep() {
    if (stepIndex > 0) {
      const prevStepObj = WIZARD_STEPS[stepIndex - 1];
      if (prevStepObj) setCurrentStep(prevStepObj.id);
    }
  }

  async function handleSave() {
    // Construct payload for save_match_result RPC
    const payload: SaveMatchResultPayload = {
      match: {
        matchName: state.matchName,
        matchDate: state.matchDate,
        opponentName: state.opponentName || null,
        venue: state.venue || null,
        matchType: state.matchType,
        format: state.format,
        result: state.result,
        teamScore: state.teamScore || null,
        overs: state.overs ? parseFloat(state.overs) : null,
        tournament: state.tournament || null,
      },
      lineups: state.lineup.map((l) => ({
        academyMemberId: l.memberId,
        battingOrder: l.battingOrder,
        isCaptain: l.isCaptain,
        isViceCaptain: l.isViceCaptain,
        isWicketkeeper: l.isWicketkeeper,
      })),
      batting: state.batting.map((b) => ({
        academyMemberId: b.memberId,
        runs: b.runs,
        balls: b.balls,
        fours: b.fours,
        sixes: b.sixes,
        isOut: b.isOut,
        dismissalType: b.dismissalType || null,
      })),
      bowling: state.bowling.map((b) => ({
        academyMemberId: b.memberId,
        overs: parseFloat(b.overs) || 0,
        maidens: b.maidens,
        runsConceded: b.runsConceded,
        wickets: b.wickets,
        wides: b.wides,
        noBalls: b.noBalls,
      })),
      fielding: state.fielding.map((f) => ({
        academyMemberId: f.memberId,
        catches: f.catches,
        runOuts: f.runOuts,
        stumpings: f.stumpings,
      })),
      awards:
        state.awards.playerOfMatchId ||
        state.awards.bestBatterId ||
        state.awards.bestBowlerId ||
        state.awards.bestFielderId
          ? {
              playerOfMatchId: state.awards.playerOfMatchId ?? undefined,
              bestBatterId: state.awards.bestBatterId ?? undefined,
              bestBowlerId: state.awards.bestBowlerId ?? undefined,
              bestFielderId: state.awards.bestFielderId ?? undefined,
            }
          : undefined,
    };

    const res = await saveMutation.mutateAsync(payload);
    onComplete(res.matchId as UUID);
  }

  return (
    <div className="space-y-6">
      {/* Progress Header / Step bar */}
      <div className="border-border-subtle bg-surface-subtle flex max-w-full overflow-x-auto rounded-xl border p-1">
        {WIZARD_STEPS.map((s, idx) => {
          const isActive = s.id === currentStep;
          const isDone = idx < stepIndex;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                if (isDone) setCurrentStep(s.id);
              }}
              disabled={!isDone && !isActive}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : isDone
                    ? 'text-primary hover:bg-surface-muted cursor-pointer'
                    : 'text-fg-muted cursor-not-allowed opacity-50'
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                  isActive
                    ? 'text-primary bg-white font-bold'
                    : isDone
                      ? 'bg-primary/20 text-primary'
                      : 'bg-surface-muted text-fg-muted'
                }`}
              >
                {idx + 1}
              </span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardBody className="p-6">
          {currentStep === 'details' && (
            <MatchDetailsStep state={state} onChange={updateState} onNext={nextStep} />
          )}

          {currentStep === 'players' && (
            <SelectPlayersStep
              state={state}
              onChange={updateState}
              onNext={nextStep}
              onBack={prevStep}
              academyId={academyId}
            />
          )}

          {currentStep === 'batting-order' && (
            <BattingOrderStep
              state={state}
              onChange={updateState}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 'scorecard' && (
            <ScorecardStep
              state={state}
              onChange={updateState}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 'awards' && (
            <AwardsStep state={state} onChange={updateState} onNext={nextStep} onBack={prevStep} />
          )}

          {currentStep === 'review' && (
            <ReviewStep
              state={state}
              onSave={handleSave}
              onBack={prevStep}
              isSubmitting={saveMutation.isPending}
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
