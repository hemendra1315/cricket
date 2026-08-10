import { useState } from 'react';
import { UserPlus, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { useAcademyStore, useAuthStore } from '@/stores';
import { AddMemberModal } from './AddMemberModal';
import { AddCoachModal } from './AddCoachModal';
import { SeedDemoDataModal } from './SeedDemoDataModal';

export function SuperAdminAcademyActions() {
  const isSuperAdmin = useAuthStore((s) => s.profile?.isSuperAdmin === true);
  const activeAcademyId = useAcademyStore((s) => s.activeAcademyId);

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);

  if (!isSuperAdmin || !activeAcademyId) return null;

  return (
    <>
      <Card className="border-brand/20 from-brand/5 via-surface to-surface mb-6 rounded-2xl border bg-gradient-to-r p-4 shadow-2xs sm:p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="text-brand h-5 w-5" />
              <h3 className="text-fg text-base font-semibold">Academy Management</h3>
              <Badge tone="brand" className="text-xs font-medium">
                Super Admin Mode
              </Badge>
            </div>
            <p className="text-fg-muted text-xs">
              Platform administrative actions for the selected academy.
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsMemberModalOpen(true)}
              className="min-h-[48px] justify-center px-4 font-medium"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsCoachModalOpen(true)}
              className="min-h-[48px] justify-center px-4 font-medium"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Add Coach
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsSeedModalOpen(true)}
              className="min-h-[48px] justify-center px-4 font-medium shadow-2xs"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Seed Demo Data
            </Button>
          </div>
        </div>
      </Card>

      <AddMemberModal
        open={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        academyId={activeAcademyId}
      />
      <AddCoachModal
        open={isCoachModalOpen}
        onClose={() => setIsCoachModalOpen(false)}
        academyId={activeAcademyId}
      />
      <SeedDemoDataModal
        open={isSeedModalOpen}
        onClose={() => setIsSeedModalOpen(false)}
        academyId={activeAcademyId}
      />
    </>
  );
}
