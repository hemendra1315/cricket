import { User } from 'lucide-react';
import { initials } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

type AvatarProps = {
  name?: string | null;
  src?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
};

const SIZES = {
  xs: 'h-5 w-5 text-[10px]',
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
} as const;

const ICON_SIZES = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
} as const;

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const base = cn('inline-flex items-center justify-center rounded-full', SIZES[size], className);

  if (src) {
    return <img src={src} alt={name ?? 'User avatar'} className={cn(base, 'object-cover')} />;
  }

  const inits = initials(name, '');

  return (
    <span className={cn(base, 'bg-primary/15 text-primary font-semibold')} aria-hidden>
      {inits || <User className={ICON_SIZES[size]} />}
    </span>
  );
}
