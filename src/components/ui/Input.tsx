import type { InputHTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean };

/** Uncontrolled-friendly text input (works directly with react-hook-form `register`). */
export function Input({ className, hasError = false, ...props }: InputProps) {
  return (
    <input
      aria-invalid={hasError || undefined}
      className={cn(
        'bg-surface text-fg border-border-subtle placeholder:text-fg-muted h-10 w-full rounded-lg border px-3 text-sm',
        'disabled:cursor-not-allowed disabled:opacity-60',
        hasError && 'border-danger',
        className,
      )}
      {...props}
    />
  );
}
