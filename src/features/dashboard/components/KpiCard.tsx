import { Card, CardBody } from '@/components/ui';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  href?: string;
}

export function KpiCard({ title, value, icon, trend, href }: KpiCardProps) {
  const content = (
    <Card className="h-full">
      <CardBody className="min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-fg-muted min-w-0 text-xs tracking-wide uppercase">{title}</p>
          {icon && <div className="text-fg-muted shrink-0">{icon}</div>}
        </div>
        <p className="text-fg truncate text-2xl font-semibold sm:text-3xl">{value}</p>
        {trend && (
          <p className={`truncate text-sm ${trend.positive ? 'text-success' : 'text-danger'}`}>
            {trend.positive ? '+' : ''}
            {trend.value} {trend.label}
          </p>
        )}
      </CardBody>
    </Card>
  );

  if (href) {
    return (
      <a href={href} className="block transition-opacity hover:opacity-80">
        {content}
      </a>
    );
  }

  return content;
}
