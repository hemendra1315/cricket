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
    <Card>
      <CardBody className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-fg-muted text-xs tracking-wide uppercase">{title}</p>
          {icon && <div className="text-fg-muted">{icon}</div>}
        </div>
        <p className="text-fg text-3xl font-semibold">{value}</p>
        {trend && (
          <p className={`text-sm ${trend.positive ? 'text-success' : 'text-danger'}`}>
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
