import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { BacktestResults } from '@/services/gssi.service'

interface BacktestChartProps {
  data: BacktestResults
}

/* Merge actual_context + all forecast series into one flat timeline */
function buildChartData(data: BacktestResults) {
  // Index actual context by date
  const actualMap = new Map(data.actual_context.map(p => [p.date, p.actual]))

  // Collect all dates
  const dateSet = new Set<string>(data.actual_context.map(p => p.date))
  for (const yr of data.years) {
    for (const pt of yr.series) dateSet.add(pt.date)
  }

  const sorted = [...dateSet].sort()

  return sorted.map(date => {
    const row: Record<string, number | null | string> = {
      date,
      actual: actualMap.get(date) ?? null,
    }
    for (const yr of data.years) {
      const pt = yr.series.find(s => s.date === date)
      row[`forecast_${yr.year}`] = pt ? pt.forecast : null
    }
    return row
  })
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const items = payload.filter((p: any) => p.value != null)
  if (!items.length) return null
  return (
    <div className="bg-[#1F1F1F] border border-[#474747] px-4 py-3 shadow-lg min-w-[180px]">
      <p className="font-mono text-[9px] text-[#C6C6C6] uppercase tracking-widest mb-2">{label}</p>
      {items.map((item: any) => (
        <div key={item.dataKey} className="flex justify-between items-center gap-4 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-[2px]" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] font-mono text-[#C6C6C6]">
              {item.dataKey === 'actual' ? 'ACTUAL' : item.name}
            </span>
          </div>
          <span className="font-['Space_Grotesk'] text-sm font-bold text-white">
            {typeof item.value === 'number' ? item.value.toFixed(3) : '—'}
          </span>
        </div>
      ))}
    </div>
  )
}

/* Year color map — mirrors Python COLORS */
const YEAR_COLORS: Record<number, string> = {
  2020: '#2ca02c',
  2021: '#17becf',
  2022: '#d62728',
  2023: '#ff7f0e',
  2024: '#1f77b4',
}

const YEAR_LABELS: Record<number, string> = {
  2020: 'COVID Shock',
  2021: 'Suez / Reopening',
  2022: 'Ukraine / Energy',
  2023: 'Post-spike Unwind',
  2024: 'Normalisation',
}

export function BacktestChart({ data }: BacktestChartProps) {
  const chartData = buildChartData(data)

  const overallMAE = data.years
    .filter(y => y.mae != null)
    .reduce((sum, y, _, arr) => sum + (y.mae ?? 0) / arr.length, 0)

  return (
    <div className="w-full bg-[#0E0E0E] p-6 relative">
      {/* Header stats */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-[#C6C6C6] tracking-widest">MODEL:</span>
            <span className="font-mono text-[9px] text-[#0F62FE] tracking-widest">HOLT-WINTERS (WALK-FORWARD)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-[#C6C6C6] tracking-widest">AVG_MAE:</span>
            <span className="font-['Space_Grotesk'] text-sm font-bold text-white">{overallMAE.toFixed(3)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-[#C6C6C6] tracking-widest">HORIZON:</span>
            <span className="font-['Space_Grotesk'] text-sm font-bold text-white">{data.horizon_months}M</span>
          </div>
        </div>
        <span className="font-mono text-[9px] text-[#474747] tracking-widest">NO_LOOKAHEAD_BIAS</span>
      </div>

      {/* MAE badges per year */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        {data.years.map(yr => (
          <div key={yr.year} className="flex items-center gap-2 border border-[#474747]/30 px-3 py-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: YEAR_COLORS[yr.year] }} />
            <span className="font-mono text-[9px] text-white tracking-widest">{yr.year}</span>
            <span className="font-mono text-[9px] text-[#C6C6C6]">{YEAR_LABELS[yr.year]}</span>
            {yr.mae != null && (
              <span className="font-mono text-[9px] text-[#0F62FE]">MAE={yr.mae.toFixed(3)}</span>
            )}
          </div>
        ))}
      </div>

      <div className="w-full h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: '#C6C6C6', fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={false}
              interval={5}
            />
            <YAxis
              tick={{ fontSize: 9, fill: '#C6C6C6', fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 0.2', 'dataMax + 0.2']}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Regime threshold reference lines */}
            <ReferenceLine y={0.5} stroke="#f0a500" strokeDasharray="3 6" strokeWidth={1}
              label={{ value: 'ELEVATED', position: 'right', fill: '#f0a500', fontSize: 8, fontFamily: 'monospace' }} />
            <ReferenceLine y={1.5} stroke="#cc0000" strokeDasharray="3 6" strokeWidth={1}
              label={{ value: 'SEVERE', position: 'right', fill: '#cc0000', fontSize: 8, fontFamily: 'monospace' }} />
            <ReferenceLine y={0} stroke="#474747" strokeWidth={0.5} />

            {/* Vertical origin lines for each forecast year */}
            {data.years.map(yr => (
              <ReferenceLine
                key={yr.year}
                x={yr.origin_date}
                stroke={YEAR_COLORS[yr.year]}
                strokeDasharray="4 4"
                strokeWidth={0.8}
              />
            ))}

            {/* Actual GSSI — bold white */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#FFFFFF"
              strokeWidth={2}
              dot={false}
              name="Actual GSSI"
              activeDot={{ r: 3, fill: '#fff', strokeWidth: 0 }}
              connectNulls={false}
            />

            {/* Forecast lines — one per year */}
            {data.years.map(yr => (
              <Line
                key={yr.year}
                type="monotone"
                dataKey={`forecast_${yr.year}`}
                stroke={YEAR_COLORS[yr.year]}
                strokeWidth={1.6}
                strokeDasharray="6 3"
                dot={false}
                name={`${yr.year} Forecast`}
                activeDot={{ r: 3, fill: YEAR_COLORS[yr.year], strokeWidth: 0 }}
                connectNulls={false}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-[2px] bg-white" />
          <span className="text-[9px] font-mono text-[#C6C6C6] uppercase tracking-widest">Actual GSSI</span>
        </div>
        {data.years.map(yr => (
          <div key={yr.year} className="flex items-center gap-2">
            <div className="w-4 border-t-2 border-dashed" style={{ borderColor: YEAR_COLORS[yr.year] }} />
            <span className="text-[9px] font-mono tracking-widest" style={{ color: YEAR_COLORS[yr.year] }}>
              {yr.year} Forecast
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
