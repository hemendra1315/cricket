import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Avatar, Button } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { ROLE_LABELS } from '@/types/enums';

import { useActiveAcademy, useMemberships } from '../hooks/useAcademies';

/** Tenant switcher for users who belong to more than one academy. */
export function AcademySwitcher({ className }: { className?: string }) {
  const { active } = useMemberships();
  const { membership, switchAcademy } = useActiveAcademy();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!membership) return null;

  // A single academy needs no switcher, just a label.
  if (active.length < 2) {
    return (
      <div className={cn('flex min-w-0 items-center gap-2', className)}>
        <Avatar name={membership.academyName} src={membership.logoUrl} size="sm" />
        <span className="text-fg max-w-[9rem] min-w-0 truncate text-sm font-medium sm:max-w-xs">
          {membership.academyName}
        </span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Button
        variant="secondary"
        size="sm"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Avatar name={membership.academyName} src={membership.logoUrl} size="xs" />
        <span className="max-w-40 truncate">{membership.academyName}</span>
        <ChevronDown className="h-4 w-4" aria-hidden />
      </Button>

      {open ? (
        <ul
          role="listbox"
          aria-label="Switch academy"
          className="bg-surface border-border-subtle absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-lg border shadow-lg"
        >
          {active.map((option) => {
            const selected = option.academyId === membership.academyId;
            return (
              <li key={option.academyId}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className="hover:bg-surface-muted flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
                  onClick={() => {
                    switchAcademy(option.academyId);
                    setOpen(false);
                  }}
                >
                  <Avatar name={option.academyName} src={option.logoUrl} size="xs" />
                  <span className="min-w-0 flex-1">
                    <span className="text-fg block truncate">{option.academyName}</span>
                    <span className="text-fg-muted block text-xs">{ROLE_LABELS[option.role]}</span>
                  </span>
                  {selected ? <Check className="text-primary h-4 w-4" aria-hidden /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
