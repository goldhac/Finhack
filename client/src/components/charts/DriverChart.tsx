import { useState } from 'react'
import type { DriverBucket } from '@/types/domain'
import { cn } from '@/lib/utils'

interface DriverChartProps {
  data: DriverBucket[]
}

const statusConfig = {
  worsening: { icon: 'trending_up', label: 'WORSENING', color: 'text-[#FFB4AB]', barAccent: '#FFB4AB' },
  stable:    { icon: 'trending_flat', label: 'STABLE', color: 'text-[#C6C6C6]', barAccent: '#0F62FE' },
  improving: { icon: 'trending_down', label: 'IMPROVING', color: 'text-[#0F62FE]', barAccent: '#0F62FE' },
}

export function DriverChart({ data }: DriverChartProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const sortedData = [...data].sort((a, b) => b.contribution - a.contribution)
  const maxContribution = Math.max(...data.map((d) => d.contribution), 1)
  const dominantDriver = sortedData[0]

  return (
    <div className="w-full space-y-6 min-h-[300px]">
      {sortedData.map((driver) => {
        const widthPercent = (driver.contribution / maxContribution) * 100
        const isDominant = driver.id === dominantDriver.id
        const isHovered = hoveredId === driver.id
        const status = statusConfig[driver.status]

        return (
          <div
            key={driver.id}
            className={cn(
              'p-4 -mx-4 transition-all duration-200 cursor-default',
              isHovered && 'bg-[#1B1B1B]',
              isDominant && !isHovered && 'bg-[#1B1B1B]/50'
            )}
            onMouseEnter={() => setHoveredId(driver.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Top row: name, status, contribution */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <span className={cn(
                  "font-['Inter'] text-[11px] font-medium tracking-widest uppercase",
                  isDominant ? 'text-white' : 'text-[#C6C6C6]'
                )}>
                  {driver.name}
                </span>
                {isDominant && (
                  <span className="text-[8px] font-bold tracking-wider bg-[#0F62FE]/10 text-[#0F62FE] px-2 py-0.5">
                    DOMINANT
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {/* Status indicator */}
                <div className={cn('flex items-center gap-1', status.color)}>
                  <span className="material-symbols-outlined text-[12px]">{status.icon}</span>
                  <span className="text-[8px] font-bold tracking-wider">{status.label}</span>
                </div>
                {/* Score & Contribution */}
                <span className="font-['Space_Grotesk'] text-lg font-bold text-white">
                  {driver.contribution}%
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-[#2A2A2A] relative overflow-hidden">
              <div
                className="h-full transition-all duration-700 ease-out"
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: driver.status === 'worsening' && isDominant ? '#FFB4AB' : '#0F62FE',
                  boxShadow: isDominant
                    ? `0 0 12px ${driver.status === 'worsening' ? 'rgba(255,180,171,0.5)' : 'rgba(15,98,254,0.5)'}`
                    : 'none',
                }}
              />
            </div>

            {/* Expanded detail on hover */}
            <div className={cn(
              'overflow-hidden transition-all duration-200',
              isHovered ? 'max-h-20 mt-3 opacity-100' : 'max-h-0 mt-0 opacity-0'
            )}>
              <div className="flex gap-6">
                <div>
                  <span className="font-mono text-[8px] text-[#C6C6C6] tracking-widest">RAW_SCORE</span>
                  <span className="block font-['Space_Grotesk'] text-sm font-bold text-white">{driver.score}/100</span>
                </div>
                <div>
                  <span className="font-mono text-[8px] text-[#C6C6C6] tracking-widest">WEIGHT</span>
                  <span className="block font-['Space_Grotesk'] text-sm font-bold text-white">{driver.contribution}%</span>
                </div>
                <div>
                  <span className="font-mono text-[8px] text-[#C6C6C6] tracking-widest">TREND</span>
                  <span className={cn('block text-sm font-bold', status.color)}>{status.label}</span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
