import { cn } from '@/lib/utils'
import type { StressRegime } from '@/types/domain'

interface StatusBadgeProps {
  regime: StressRegime
  className?: string
}

const regimeConfig: Record<
  StressRegime,
  { label: string; color: string; dotColor: string }
> = {
  low: {
    label: 'STABLE_SIGNAL',
    color: 'text-[#0052DD]',
    dotColor: 'bg-[#0052DD]',
  },
  elevated: {
    label: 'WARNING_STATE',
    color: 'text-[#FFB4AB]',
    dotColor: 'bg-[#FFB4AB]',
  },
  high: {
    label: 'HIGH_ALERT',
    color: 'text-[#FFB4AB]',
    dotColor: 'bg-[#FFB4AB]',
  },
  critical: {
    label: 'CRITICAL_STATE',
    color: 'text-[#FFB4AB]',
    dotColor: 'bg-[#93000A]',
  },
}

export function StatusBadge({ regime, className }: StatusBadgeProps) {
  const { label, color, dotColor } = regimeConfig[regime]

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2',
        className
      )}
    >
      <div className={cn('w-2 h-2 rounded-full', dotColor)} />
      <span className={cn('text-[10px] font-mono tracking-widest uppercase', color)}>
        {label}
      </span>
    </div>
  )
}
