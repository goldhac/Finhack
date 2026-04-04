import type { MarketImplication } from '@/types/domain'
import { cn } from '@/lib/utils'

interface ImplicationChartProps {
  data: MarketImplication[]
}

const impactConfig = {
  positive: {
    label: 'POSITIVE',
    signal: '↑',
    badgeClass: 'bg-[#0F62FE]/10 text-[#0F62FE]',
    dotClass: 'bg-[#0F62FE]',
  },
  neutral: {
    label: 'NEUTRAL',
    signal: '→',
    badgeClass: 'bg-white/5 text-[#C6C6C6]',
    dotClass: 'bg-[#474747]',
  },
  negative: {
    label: 'NEGATIVE',
    signal: '↓',
    badgeClass: 'bg-[#FFB4AB]/10 text-[#FFB4AB]',
    dotClass: 'bg-[#FFB4AB]',
  },
}

export function ImplicationChart({ data }: ImplicationChartProps) {
  return (
    <div className="w-full overflow-hidden">
      <table className="w-full text-left">
        <thead className="border-b border-[#474747]/15">
          <tr>
            <th className="pb-4 font-['Inter'] text-[9px] tracking-widest uppercase text-[#C6C6C6] font-medium w-[120px]">
              Theme
            </th>
            <th className="pb-4 font-['Inter'] text-[9px] tracking-widest uppercase text-[#C6C6C6] font-medium w-[100px]">
              Impact
            </th>
            <th className="pb-4 font-['Inter'] text-[9px] tracking-widest uppercase text-[#C6C6C6] font-medium">
              Analysis
            </th>
            <th className="pb-4 font-['Inter'] text-[9px] tracking-widest uppercase text-[#C6C6C6] font-medium text-right w-[60px]">
              Signal
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#474747]/10">
          {data.map((item) => {
            const config = impactConfig[item.impact]

            return (
              <tr
                key={item.id}
                className="group hover:bg-[#1B1B1B] transition-all duration-150 cursor-default"
              >
                {/* Theme */}
                <td className="py-5">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-1.5 h-1.5 rounded-full', config.dotClass)} />
                    <span className="font-['Space_Grotesk'] text-sm font-bold text-white uppercase tracking-tight">
                      {item.theme}
                    </span>
                  </div>
                </td>

                {/* Impact Badge */}
                <td className="py-5">
                  <span className={cn(
                    'px-2 py-1 text-[9px] font-bold tracking-wider',
                    config.badgeClass
                  )}>
                    {config.label}
                  </span>
                </td>

                {/* Description */}
                <td className="py-5 font-['Inter'] text-[11px] text-[#C6C6C6] leading-relaxed pr-4 group-hover:text-white transition-colors duration-150">
                  {item.description}
                </td>

                {/* Signal */}
                <td className="py-5 text-right">
                  <span className={cn(
                    'font-["Space_Grotesk"] text-lg font-bold',
                    item.impact === 'negative' ? 'text-[#FFB4AB]' :
                    item.impact === 'positive' ? 'text-[#0F62FE]' : 'text-[#C6C6C6]'
                  )}>
                    {config.signal}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
