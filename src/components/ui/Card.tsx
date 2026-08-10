import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-surface border-border-subtle rounded-card border shadow-sm', className)}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'border-border-subtle flex flex-wrap items-start justify-between gap-3 border-b p-4',
        className,
      )}
    >
      <div className="min-w-0">
        <h3 className="text-fg text-base font-semibold text-balance">{title}</h3>
        {description ? <p className="text-fg-muted mt-1 text-sm">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-4', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'border-border-subtle flex items-center justify-end gap-2 border-t p-4',
        className,
      )}
      {...props}
    />
  );
}
