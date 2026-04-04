import { AppShell } from '@/components/layout/AppShell'
import { AppHeader } from '@/components/layout/AppHeader'
import { SectionCard } from '@/components/layout/SectionCard'
import { MetricCard } from '@/components/common/MetricCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { TrendChart } from '@/components/charts/TrendChart'
import { ForecastChart } from '@/components/charts/ForecastChart'
import { DriverChart } from '@/components/charts/DriverChart'
import { ImplicationChart } from '@/components/charts/ImplicationChart'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { useDashboard } from '@/hooks/useDashboard'

import { cn } from '@/lib/utils'

/* ── Helpers ── */
const trendArrow = (dir: 'up' | 'down' | 'flat') =>
  dir === 'up' ? '↑' : dir === 'down' ? '↓' : '→'

const trendType = (dir: 'up' | 'down' | 'flat'): 'up' | 'down' | 'neutral' =>
  dir === 'up' ? 'up' : dir === 'down' ? 'down' : 'neutral'

export function DashboardPage() {
  const { summary, history, forecast, drivers, implications, recommendations, refreshStatus } = useDashboard()

  return (
    <AppShell>
      <AppHeader />

      {/* ═══ Data Freshness Bar ═══ */}
      {refreshStatus.data && (
        <div className="flex items-center justify-between px-0 py-3 mb-8 border-b border-[#474747]/20">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${
              refreshStatus.data.pipeline_exit_code === 0
                ? 'bg-green-500 animate-pulse'
                : refreshStatus.data.timestamp_utc
                  ? 'bg-yellow-500'
                  : 'bg-[#474747]'
            }`} />
            <span className="font-mono text-[10px] text-[#C6C6C6] tracking-widest uppercase">
              {refreshStatus.data.timestamp_utc
                ? `DATA_LAST_REFRESHED: ${new Date(refreshStatus.data.timestamp_utc).toUTCString()}`
                : 'NO_REFRESH_RUN — execute data_refresh.py to load live data'
              }
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#474747] tracking-widest">
            LIVE_PIPELINE_DATA
          </span>
        </div>
      )}

      {/* ═══ Row 1 — Hero Metrics ═══ */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-0 mb-20">
        {summary.isLoading ? (
          <div className="col-span-4 p-12">
            <LoadingState rows={1} />
          </div>
        ) : summary.error ? (
          <div className="col-span-4 p-12">
            <ErrorState message="Failed to load overview analytics." onRetry={() => summary.refetch()} />
          </div>
        ) : summary.data ? (
          <>
            {/* Current GSSI — primary metric */}
            <MetricCard
              label="Global_Stress_Index"
              value={summary.data.currentGSSI.toString()}
              unit="/100"
              gradient={true}
              subtext={`${trendArrow(summary.data.trendDirection)} TREND_${summary.data.trendDirection.toUpperCase()}`}
            />

            {/* Stress Regime */}
            <MetricCard
              label="Stress_Regime"
              value={summary.data.stressRegime.toUpperCase()}
              trend={trendType(summary.data.trendDirection)}
              trendLabel={`${trendArrow(summary.data.trendDirection)} DIRECTION`}
            >
              <StatusBadge regime={summary.data.stressRegime} className="mt-1" />
            </MetricCard>

            {/* 1-Month Forecast */}
            <MetricCard
              label="Forecast_1M"
              value={summary.data.forecast1Month.toString()}
              unit="/100"
              trend={summary.data.forecast1Month > summary.data.currentGSSI ? 'up' : summary.data.forecast1Month < summary.data.currentGSSI ? 'down' : 'neutral'}
              trendLabel={`${summary.data.forecast1Month > summary.data.currentGSSI ? '+' : ''}${(summary.data.forecast1Month - summary.data.currentGSSI).toFixed(0)} DELTA`}
            />

            {/* 3-Month Forecast */}
            <MetricCard
              label="Forecast_3M"
              value={summary.data.forecast3Month.toString()}
              unit="/100"
              trend={summary.data.forecast3Month > summary.data.currentGSSI ? 'up' : 'neutral'}
              trendLabel={`${(summary.data.forecast3MonthProbability * 100).toFixed(0)}% PROBABILITY`}
            />
          </>
        ) : null}
      </section>

      {/* ═══ Row 2 — Macro Trend Chart ═══ */}
      <section className="mb-24">
        {history.isLoading ? (
          <div className="h-[500px] bg-[#0E0E0E] flex items-center justify-center">
            <LoadingState rows={8} />
          </div>
        ) : history.error ? (
          <div className="h-[500px] bg-[#0E0E0E] flex items-center justify-center">
            <ErrorState message="Failed to load trajectory vectors." onRetry={() => history.refetch()} />
          </div>
        ) : history.data ? (
          <TrendChart
            data={history.data}
            currentGSSI={summary.data?.currentGSSI}
            regime={summary.data?.stressRegime}
          />
        ) : null}
      </section>

      {/* ═══ Row 3 — Forecast Models ═══ */}
      <section className="mb-24">
        <SectionCard title="Predictive Deviation Models">
          {forecast.isLoading ? (
            <LoadingState rows={8} />
          ) : forecast.error ? (
            <ErrorState message="Failed to load predictive modeling." onRetry={() => forecast.refetch()} />
          ) : forecast.data ? (
            <ForecastChart
              data={forecast.data}
              forecast1M={summary.data?.forecast1Month}
              forecast3M={summary.data?.forecast3Month}
              probability={summary.data?.forecast3MonthProbability}
            />
          ) : null}
        </SectionCard>
      </section>

      {/* ═══ Row 4 — Factor Decomposition & Market Implications ═══ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
        {/* Factor Decomposition */}
        <div className="lg:col-span-5">
          <SectionCard title="Factor Decomposition">
            {drivers.isLoading ? (
              <LoadingState rows={8} />
            ) : drivers.error ? (
              <ErrorState message="Failed to decompose drivers." onRetry={() => drivers.refetch()} />
            ) : drivers.data ? (
              <DriverChart data={drivers.data} />
            ) : null}
          </SectionCard>
        </div>

        {/* Market Implications */}
        <div className="lg:col-span-7">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-6 bg-[#0F62FE]" />
              <h3 className="font-['Space_Grotesk'] text-2xl font-bold tracking-tight text-white uppercase">
                Market Implications
              </h3>
            </div>
            <button className="text-[10px] font-['Inter'] tracking-[0.2em] uppercase text-[#0052DD] border-b border-[#0052DD]/30 pb-1 hover:border-[#0052DD] transition-colors">
              EXPORT_LEDGER
            </button>
          </div>
          {implications.isLoading ? (
            <LoadingState rows={8} />
          ) : implications.error ? (
            <ErrorState message="Failed to compile market implications." onRetry={() => implications.refetch()} />
          ) : implications.data ? (
            <ImplicationChart data={implications.data} />
          ) : null}
        </div>
      </section>

      {/* ═══ Row 5 — Executive Directives ═══ */}
      <section className="mb-12">
        <div className="flex items-center gap-6 mb-12">
          <h3 className="font-['Space_Grotesk'] text-4xl font-extrabold tracking-[-0.04em] text-white uppercase">
            Executive Directives
          </h3>
          <div className="flex-1 h-[1px] bg-[#474747]/20" />
          <span className="font-['Inter'] text-[10px] tracking-widest text-[#C6C6C6]">
            {recommendations.data ? `${recommendations.data.length}_PENDING_APPROVAL` : '...'}
          </span>
        </div>

        {recommendations.isLoading ? (
          <LoadingState rows={3} />
        ) : recommendations.error ? (
          <ErrorState message="Failed to load operational directives." onRetry={() => recommendations.refetch()} />
        ) : recommendations.data ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {recommendations.data.map((rec, index) => {
              const icons = ['verified_user', 'security', 'bolt']
              const isHigh = rec.confidence === 'High'
              const isMed = rec.confidence === 'Medium'

              /* Derive ref-code from the action semantically */
              const refCode = `DIR_${String(index + 1).padStart(3, '0')}_${rec.action.split(' ')[0].toUpperCase().slice(0, 5)}`

              return (
                <div
                  key={rec.id}
                  className={cn(
                    'group border border-[#474747]/15 p-8 hover:bg-[#1F1F1F] transition-all duration-200 cursor-pointer relative overflow-hidden',
                    index > 0 && 'border-l-0',
                    isHigh && 'hover:border-[#0F62FE]/30'
                  )}
                >
                  {/* Background icon */}
                  <div className="absolute top-0 right-0 p-4 opacity-[0.06] group-hover:opacity-100 transition-opacity duration-300">
                    <span className={cn(
                      'material-symbols-outlined text-4xl',
                      isHigh ? 'text-[#0F62FE]' : isMed ? 'text-[#FFB4AB]' : 'text-[#C6C6C6]'
                    )}>
                      {icons[index] || 'bolt'}
                    </span>
                  </div>

                  {/* Reference & Confidence */}
                  <div className="flex justify-between items-start mb-12">
                    <span className={cn(
                      'font-mono text-[9px]',
                      isHigh ? 'text-[#0052DD]' : 'text-[#C6C6C6]'
                    )}>
                      REF: {refCode}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        isHigh ? 'bg-[#0052DD] pulse-dot' : isMed ? 'bg-[#FFB4AB]' : 'bg-[#474747]'
                      )} />
                      <span className={cn(
                        'text-[8px] font-bold uppercase tracking-wider',
                        isHigh ? 'text-[#0052DD]' : isMed ? 'text-[#FFB4AB]' : 'text-[#C6C6C6]'
                      )}>
                        {rec.confidence?.toUpperCase() || 'MED'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <h4 className="font-['Space_Grotesk'] text-xl font-bold text-white mb-4 leading-tight group-hover:text-[#0F62FE] transition-colors duration-200">
                    {rec.action}
                  </h4>
                  <p className="font-['Inter'] text-xs text-[#C6C6C6] leading-relaxed mb-12">
                    {rec.rationale}
                  </p>

                  {/* Execute Button */}
                  <button
                    className={cn(
                      'w-full text-white text-[10px] font-bold uppercase tracking-[0.2em] py-4 transition-all duration-200',
                      'bg-[#353535] group-hover:bg-[#0F62FE] group-hover:shadow-[0_0_20px_rgba(15,98,254,0.3)]'
                    )}
                  >
                    Execute_Directive
                  </button>
                </div>
              )
            })}
          </div>
        ) : null}
      </section>
    </AppShell>
  )
}
