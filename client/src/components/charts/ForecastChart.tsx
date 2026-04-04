import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { ForecastPoint } from '@/types/domain'

interface ForecastChartProps {
  data: ForecastPoint[]
  forecast1M?: number
  forecast3M?: number
  probability?: number
}

/* Enrich data with confidence band */
function enrichData(data: ForecastPoint[]) {
  return data.map((point) => ({
    ...point,
    upper: point.forecast != null ? point.forecast * 1.08 : null,
    lower: point.forecast != null ? point.forecast * 0.92 : null,
  }))
}

/* Custom tooltip */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const actual = payload.find((p: any) => p.dataKey === 'actual')
  const forecast = payload.find((p: any) => p.dataKey === 'forecast')
  return (
    <div className="bg-[#1F1F1F] border border-[#474747] px-4 py-3 shadow-lg min-w-[140px]">
      <p className="font-mono text-[9px] text-[#C6C6C6] uppercase tracking-widest mb-2">{label}</p>
      {actual?.value != null && (
        <div className="flex justify-between items-center gap-4 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-[2px] bg-[#0F62FE]" />
            <span className="text-[10px] font-mono text-[#C6C6C6]">ACTUAL</span>
          </div>
          <span className="font-['Space_Grotesk'] text-sm font-bold text-white">
            {actual.value.toFixed(1)}
          </span>
        </div>
      )}
      {forecast?.value != null && (
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-[2px] bg-[#FFB4AB] border-dashed" style={{ borderTop: '2px dashed #FFB4AB', height: 0 }} />
            <span className="text-[10px] font-mono text-[#C6C6C6]">FORECAST</span>
          </div>
          <span className="font-['Space_Grotesk'] text-sm font-bold text-[#FFB4AB]">
            {forecast.value.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  )
}

export function ForecastChart({ data, forecast1M, forecast3M, probability }: ForecastChartProps) {
  const enriched = enrichData(data)

  /* Find connection point */
  const connectionIdx = data.findIndex((p) => p.actual != null && p.forecast != null)
  const connectionDate = connectionIdx >= 0 ? data[connectionIdx].date : null

  return (
    <div className="w-full h-[400px] bg-[#0E0E0E] p-6 relative group">
      {/* Forecast summary stats */}
      <div className="absolute top-4 left-6 flex items-center gap-8 z-10">
        {forecast1M != null && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-[#C6C6C6] tracking-widest">1M_TARGET:</span>
            <span className="font-['Space_Grotesk'] text-sm font-bold text-white">{forecast1M}</span>
          </div>
        )}
        {forecast3M != null && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-[#C6C6C6] tracking-widest">3M_TARGET:</span>
            <span className="font-['Space_Grotesk'] text-sm font-bold text-white">{forecast3M}</span>
          </div>
        )}
        {probability != null && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-[#C6C6C6] tracking-widest">CONF:</span>
            <span className="font-['Space_Grotesk'] text-sm font-bold text-[#0F62FE]">
              {(probability * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-6 flex items-center gap-6 z-10">
        <div className="flex items-center gap-2">
          <div className="w-4 h-[2px] bg-[#0F62FE]" />
          <span className="text-[9px] font-mono text-[#C6C6C6] uppercase tracking-widest">Actual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 border-t-2 border-dashed border-[#FFB4AB]" />
          <span className="text-[9px] font-mono text-[#C6C6C6] uppercase tracking-widest">Forecast</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 bg-[#FFB4AB]/10" />
          <span className="text-[9px] font-mono text-[#C6C6C6] uppercase tracking-widest">Conf. Band</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={enriched} margin={{ top: 40, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFB4AB" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#FFB4AB" stopOpacity={0.02} />
            </linearGradient>
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
            domain={['dataMin - 5', 'dataMax + 10']}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Connection point reference */}
          {connectionDate && (
            <ReferenceLine
              x={connectionDate}
              stroke="#474747"
              strokeDasharray="3 6"
              label={{
                value: 'NOW',
                position: 'top',
                fill: '#C6C6C6',
                fontSize: 9,
                fontFamily: 'monospace',
              }}
            />
          )}

          {/* Confidence band */}
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="url(#forecastBand)"
            connectNulls={false}
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="transparent"
            connectNulls={false}
          />

          {/* Actual line */}
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#0F62FE"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#fff', stroke: '#0F62FE', strokeWidth: 2 }}
            connectNulls={false}
          />

          {/* Forecast line */}
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#FFB4AB"
            strokeDasharray="6 4"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#FFB4AB', stroke: '#fff', strokeWidth: 2 }}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
