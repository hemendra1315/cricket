import { initials } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

type AvatarProps = {
  name?: string | null;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const SIZES = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base' } as const;

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const base = cn('inline-flex items-center justify-center rounded-full', SIZES[size], className);

  if (src) {
    return <img src={src} alt={name ?? 'User avatar'} className={cn(base, 'object-cover')} />;
  }

  return (
    <span className={cn(base, 'bg-primary/15 text-primary font-semibold')} aria-hidden>
      {initials(name)}
    </span>
  );
}
