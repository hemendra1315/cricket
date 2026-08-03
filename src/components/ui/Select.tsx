import type { SelectHTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean };

export function Select({ className, hasError = false, children, ...props }: SelectProps) {
  return (
    <select
      aria-invalid={hasError || undefined}
      className={cn(
        'bg-surface text-fg border-border-subtle h-10 w-full rounded-lg border px-3 text-sm',
        'disabled:cursor-not-allowed disabled:opacity-60',
        hasError && 'border-danger',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
