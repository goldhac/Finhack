import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: string | number
  subtext?: string
  unit?: string
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  className?: string
  icon?: ReactNode
  gradient?: boolean
  children?: ReactNode
}

export function MetricCard({
  label,
  value,
  subtext,
  unit,
  trend,
  trendLabel,
  className,
  gradient = false,
  children,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'group border-l border-[#474747]/15 pl-6 py-4 transition-all duration-200 hover:bg-[#1B1B1B]/40',
        className
      )}
    >
      <p className="font-['Inter'] text-[0.6875rem] text-[#C6C6C6] uppercase tracking-[0.2em] mb-1">
        {label}
      </p>
      <h2
        className={cn(
          "font-['Space_Grotesk'] text-5xl md:text-6xl font-extrabold tracking-[-0.04em] transition-transform duration-200 group-hover:translate-x-1",
          gradient ? 'litho-gradient' : 'text-white'
        )}
      >
        {value}
        {unit && (
          <span className="text-lg align-top ml-1 text-[#C6C6C6] font-normal">{unit}</span>
        )}
      </h2>

      {/* Children slot for custom content like StatusBadge */}
      {children}

      <div className="flex items-center gap-2 mt-2">
        {trend === 'up' && (
          <>
            <span className="material-symbols-outlined text-[#FFB4AB] text-[14px]">
              trending_up
            </span>
            <span className="text-[10px] font-mono text-[#FFB4AB]">
              {trendLabel || '+DELTA'}
            </span>
          </>
        )}
        {trend === 'down' && (
          <>
            <span className="material-symbols-outlined text-[#0F62FE] text-[14px]">
              trending_down
            </span>
            <span className="text-[10px] font-mono text-[#0F62FE]">
              {trendLabel || '-DELTA'}
            </span>
          </>
        )}
        {trend === 'neutral' && (
          <>
            <div className="w-2 h-2 rounded-full bg-[#0052DD]" />
            <span className="text-[10px] font-mono text-[#C6C6C6]">
              {trendLabel || 'STABLE'}
            </span>
          </>
        )}
        {!trend && subtext && (
          <>
            <div className="w-12 h-[1px] bg-[#0052DD]" />
            <span className="text-[10px] font-mono text-[#0052DD]">
              {subtext}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
