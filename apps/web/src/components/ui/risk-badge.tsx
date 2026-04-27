import { cn } from '@/lib/utils';
import { RiskLevel } from '@edupulse/types';

const styles: Record<RiskLevel, string> = {
  HIGH: 'bg-danger/10 text-danger border-danger/20',
  MEDIUM: 'bg-warning/10 text-warning border-warning/20',
  LOW: 'bg-success/10 text-success border-success/20',
};

const labels: Record<RiskLevel, string> = {
  HIGH: 'Alto',
  MEDIUM: 'Médio',
  LOW: 'Baixo',
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', styles[level])}>
      {labels[level]}
    </span>
  );
}
