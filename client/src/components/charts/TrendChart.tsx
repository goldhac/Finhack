import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { TrendPoint } from '@/types/domain'
import type { StressRegime } from '@/types/domain'
import chartBg from '@/assets/chart-bg.png'

interface TrendChartProps {
  data: TrendPoint[]
  currentGSSI?: number
  regime?: StressRegime
}

/* Custom tooltip */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1F1F1F] border border-[#474747] px-4 py-3 shadow-lg">
      <p className="font-mono text-[9px] text-[#C6C6C6] uppercase tracking-widest mb-1">{label}</p>
      <p className="font-['Space_Grotesk'] text-lg font-bold text-white">
        {payload[0].value.toFixed(1)}
        <span className="text-[10px] text-[#C6C6C6] ml-1">GSSI</span>
      </p>
    </div>
  )
}

export function TrendChart({ data, currentGSSI, regime }: TrendChartProps) {
  const latestValue = data.length > 0 ? data[data.length - 1].value : 0
  const firstValue = data.length > 0 ? data[0].value : 0
  const delta = latestValue - firstValue
  const deltaPercent = firstValue > 0 ? ((delta / firstValue) * 100).toFixed(1) : '0.0'

  /* Derive regime label */
  const regimeLabel = regime
    ? regime === 'low' ? 'STABLE' : regime === 'elevated' ? 'ELEVATED' : regime === 'high' ? 'HIGH' : 'CRITICAL'
    : 'COMPUTING'

  /* Generate ticker data from history */
  const tickerItems = useMemo(() => {
    if (data.length < 2) return []
    return data.slice(-6).map((point, i, arr) => {
      const prev = i > 0 ? arr[i - 1].value : point.value
      const change = ((point.value - prev) / prev * 100).toFixed(2)
      const sign = point.value >= prev ? '+' : ''
      return {
        label: point.date,
        value: point.value.toFixed(1),
        change: `${sign}${change}%`,
        positive: point.value >= prev,
      }
    })
  }, [data])

  return (
    <div className="w-full h-[500px] relative overflow-hidden bg-[#0E0E0E] group">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#131313] to-transparent z-10 pointer-events-none" />

      {/* Header labels */}
      <div className="absolute top-8 left-8 z-20">
        <h3 className="font-['Space_Grotesk'] text-xl font-bold tracking-tight text-white mb-1">
          Macro Trend Trajectory
        </h3>
        <p className="font-['Inter'] text-[10px] uppercase tracking-[0.3em] text-[#C6C6C6]">
          Instrument: GLOBAL_SUPPLY_CHAIN_STRESS_INDEX
        </p>
      </div>

      {/* Regime badge */}
      <div className="absolute top-8 right-8 z-20 flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full pulse-dot ${
          regime === 'low' ? 'bg-[#0F62FE]' :
          regime === 'critical' ? 'bg-[#93000A]' : 'bg-[#FFB4AB]'
        }`} />
        <span className={`font-mono text-[10px] tracking-widest ${
          regime === 'low' ? 'text-[#0F62FE]' :
          regime === 'critical' ? 'text-[#93000A]' : 'text-[#FFB4AB]'
        }`}>
          REGIME_{regimeLabel}
        </span>
      </div>

      {/* Background image */}
      <div className="absolute inset-0">
        <div className="w-full h-full opacity-40 mix-blend-screen overflow-hidden">
          <img
            className="w-full h-full object-cover brightness-75 contrast-125"
            src={chartBg}
            alt="Data flow visualization"
          />
        </div>
      </div>

      {/* Chart */}
      <div className="absolute inset-0 z-[15] pt-20">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 40, right: 30, left: 10, bottom: 60 }}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F62FE" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#0F62FE" stopOpacity={0} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: '#C6C6C6', fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: '#C6C6C6', fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Stress threshold lines */}
            <ReferenceLine y={50} stroke="#474747" strokeDasharray="3 6" label="" />
            <ReferenceLine y={75} stroke="#FFB4AB" strokeDasharray="3 6" strokeOpacity={0.3} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#0F62FE"
              strokeWidth={2}
              fill="url(#trendGradient)"
              dot={false}
              activeDot={{ r: 5, fill: '#fff', stroke: '#0F62FE', strokeWidth: 2 }}
              filter="url(#glow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Micro Labels — driven by data */}
      <div className="absolute top-1/2 right-12 z-20 text-right">
        <span className="block font-mono text-[8px] text-[#0052DD] mb-1">CURRENT_GSSI</span>
        <span className="block font-['Space_Grotesk'] text-3xl font-bold text-white">
          {currentGSSI ?? latestValue.toFixed(1)}
        </span>
        <span className={`block font-mono text-[10px] mt-1 ${delta >= 0 ? 'text-[#FFB4AB]' : 'text-[#0F62FE]'}`}>
          {delta >= 0 ? '↑' : '↓'} {deltaPercent}% PERIOD_DELTA
        </span>
      </div>

      {/* Dynamic Ticker Tape — derived from data */}
      <div className="absolute bottom-0 left-0 w-full h-12 bg-[#0E0E0E]/80 border-t border-[#474747]/10 flex items-center z-30 px-6 overflow-hidden">
        <div className="flex gap-12 whitespace-nowrap opacity-50 animate-ticker">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="text-[9px] font-mono tracking-widest">
              <span className="text-[#0052DD]">{item.label}</span>{' '}
              <span className="text-white">{item.value}</span>{' '}
              <span className={item.positive ? 'text-[#0F62FE]' : 'text-[#FFB4AB]'}>
                ({item.change})
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
