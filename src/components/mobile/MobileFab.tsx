import { Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useCan } from '@/lib/rbac';

type MobileFabProps = {
  onClick?: () => void;
  overrideShow?: boolean;
};

export function MobileFab({ onClick, overrideShow }: MobileFabProps) {
  const location = useLocation();
  const canManageBatches = useCan('batches:manage');
  const canManagePlayers = useCan('players:manage');
  const canManageSessions = useCan('sessions:manage');
  const canManageMatches = useCan('matches:manage');

  let shouldShow = overrideShow ?? false;
  const actionFn = onClick;

  if (overrideShow === undefined) {
    if (location.pathname.startsWith('/batches') && canManageBatches) {
      shouldShow = true;
    } else if (location.pathname.startsWith('/members') && canManagePlayers) {
      shouldShow = true;
    } else if (location.pathname.startsWith('/sessions') && canManageSessions) {
      shouldShow = true;
    } else if (location.pathname.startsWith('/matches') && canManageMatches) {
      shouldShow = true;
    }
  }

  if (!shouldShow || !actionFn) return null;

  return (
    <button
      onClick={actionFn}
      className="bg-primary text-primary-fg hover:bg-primary/90 fixed right-4 bottom-20 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95 md:hidden"
      aria-label="Create item"
    >
      <Plus className="h-6 w-6 stroke-[2.5]" />
    </button>
  );
}
