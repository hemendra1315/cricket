import { UserPlus, UserCheck, Layers, CalendarCheck, CalendarDays, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobileQuickAction } from '@/components/mobile';
import { useCan } from '@/lib/rbac';

export function DashboardQuickActions() {
  const navigate = useNavigate();
  const canManagePlayers = useCan('players:manage');
  const canManageBatches = useCan('batches:manage');
  const canManageSessions = useCan('sessions:manage');
  const canManageMatches = useCan('matches:manage');
  const canMarkAttendance = useCan('attendance:mark');

  const actions = [
    canManagePlayers && {
      label: 'Add Player',
      icon: <UserPlus className="h-5 w-5" />,
      onClick: () => navigate('/members'),
    },
    canManagePlayers && {
      label: 'Add Coach',
      icon: <UserCheck className="h-5 w-5" />,
      onClick: () => navigate('/members'),
    },
    canManageBatches && {
      label: 'Create Batch',
      icon: <Layers className="h-5 w-5" />,
      onClick: () => navigate('/batches'),
    },
    canMarkAttendance && {
      label: 'Mark Attendance',
      icon: <CalendarCheck className="h-5 w-5" />,
      onClick: () => navigate('/sessions'),
    },
    canManageSessions && {
      label: 'Create Session',
      icon: <CalendarDays className="h-5 w-5" />,
      onClick: () => navigate('/sessions'),
    },
    canManageMatches && {
      label: 'Add Match',
      icon: <Trophy className="h-5 w-5" />,
      onClick: () => navigate('/matches/add'),
    },
  ].filter(Boolean);

  if (actions.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-fg-muted px-0.5 text-xs font-semibold tracking-wider uppercase">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {actions.map((act, idx) => {
          if (!act) return null;
          return (
            <MobileQuickAction key={idx} label={act.label} icon={act.icon} onClick={act.onClick} />
          );
        })}
      </div>
    </div>
  );
}
