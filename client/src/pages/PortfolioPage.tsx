import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { AppHeader } from '@/components/layout/AppHeader'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { usePortfolio } from '@/hooks/usePortfolio'
import { cn } from '@/lib/utils'
import type { AllocationTier, SectorSentiment, SignalDirection, EquitySentiment, ProtocolType } from '@/types/portfolio'

/* ── Config maps ── */
const tierConfig: Record<AllocationTier, { heading: string; tag: string; headingColor: string; tagColor: string }> = {
  overweight: { heading: '01_OVERWEIGHT', tag: 'STRATEGIC_PULL', headingColor: 'text-white', tagColor: 'text-[#0F62FE]' },
  neutral:    { heading: '02_NEUTRAL',    tag: 'HOLD_VECTOR',    headingColor: 'text-[#C6C6C6]', tagColor: 'text-[#C6C6C6]' },
  avoid:      { heading: '03_AVOID',      tag: 'LIQUIDATE',      headingColor: 'text-[#FFB4AB]', tagColor: 'text-[#FFB4AB]' },
}

const tierBg: Record<AllocationTier, string> = {
  overweight: 'bg-[#1F1F1F]',
  neutral:    'bg-[#1B1B1B]',
  avoid:      'bg-[#0E0E0E]',
}

const sentimentConfig: Record<SectorSentiment, { dot: string; label: string; textColor: string }> = {
  bullish: { dot: 'bg-[#0F62FE]', label: 'Bullish', textColor: '' },
  neutral: { dot: 'bg-[#C6C6C6]', label: 'Neutral', textColor: '' },
  bearish: { dot: 'bg-[#FFB4AB]', label: 'Bearish', textColor: 'text-[#FFB4AB]' },
}

const signalConfig: Record<SignalDirection, { icon: string; label: string; color: string }> = {
  positive: { icon: 'north', label: 'POS', color: 'text-[#0F62FE]' },
  neutral:  { icon: 'trending_flat', label: 'NEU', color: 'text-[#C6C6C6]' },
  negative: { icon: 'south', label: 'NEG', color: 'text-[#FFB4AB]' },
}

const equitySentimentConfig: Record<EquitySentiment, { borderColor: string; textColor: string; label: string }> = {
  positive:        { borderColor: 'border-[#0F62FE]/30', textColor: 'text-[#0F62FE]', label: 'Positive' },
  neutral:         { borderColor: 'border-[#474747]/30', textColor: 'text-[#C6C6C6]', label: 'Neutral' },
  negative:        { borderColor: 'border-[#FFB4AB]/30', textColor: 'text-[#FFB4AB]', label: 'Negative' },
  high_conviction: { borderColor: 'border-[#0F62FE]/30', textColor: 'text-[#0F62FE]', label: 'High_Conv' },
}

const protocolConfig: Record<ProtocolType, { badge: string; badgeBg: string; badgeText: string; border: string }> = {
  alpha:     { badge: 'ALPHA_CALL',    badgeBg: 'bg-[#0F62FE]', badgeText: 'text-white', border: 'border-[#0F62FE]' },
  defense:   { badge: 'DEFENSE_CALL',  badgeBg: 'bg-[#FFB4AB]', badgeText: 'text-black', border: 'border-[#FFB4AB]' },
  hedge:     { badge: 'HEDGE_CALL',    badgeBg: 'bg-[#C6C6C6]', badgeText: 'text-black', border: 'border-[#C6C6C6]' },
  rebalance: { badge: 'REBALANCE',     badgeBg: 'bg-[#474747]', badgeText: 'text-white', border: 'border-[#474747]' },
}

const trendIcon = (dir: 'up' | 'down' | 'flat') =>
  dir === 'up' ? 'trending_up' : dir === 'down' ? 'trending_down' : 'trending_flat'

export function PortfolioPage() {
  const {
    isLoading,
    isError,
    regime,
    allocations,
    sectors,
    equities,
    drivers,
    intelligence,
    protocols,
  } = usePortfolio()

  const [equitySearch, setEquitySearch] = useState('')

  if (isLoading) {
    return (
      <AppShell>
        <AppHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingState rows={12} />
        </div>
      </AppShell>
    )
  }

  if (isError) {
    return (
      <AppShell>
        <AppHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <ErrorState message="Failed to load portfolio strategy data." />
        </div>
      </AppShell>
    )
  }

  const now = new Date()
  const systemTime = `${now.getUTCFullYear()}.${String(now.getUTCMonth() + 1).padStart(2, '0')}.${String(now.getUTCDate()).padStart(2, '0')}_${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}_UTC`

  const filteredEquities = equities?.filter(
    (eq) =>
      eq.ticker.toLowerCase().includes(equitySearch.toLowerCase()) ||
      eq.companyName.toLowerCase().includes(equitySearch.toLowerCase())
  ) ?? []

  const overweightAllocs = allocations?.filter((a) => a.tier === 'overweight') ?? []
  const neutralAllocs = allocations?.filter((a) => a.tier === 'neutral') ?? []
  const avoidAllocs = allocations?.filter((a) => a.tier === 'avoid') ?? []

  const tiers: { tier: AllocationTier; items: typeof overweightAllocs }[] = [
    { tier: 'overweight', items: overweightAllocs },
    { tier: 'neutral', items: neutralAllocs },
    { tier: 'avoid', items: avoidAllocs },
  ]

  return (
    <AppShell>
      <AppHeader />

      {/* ═══ Header ═══ */}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[10px] font-['Inter'] tracking-[0.3em] text-[#0F62FE] uppercase mb-2 block">
              STRATEGY_ENGINE / PORTFOLIO_CORE
            </span>
            <h1 className="text-6xl font-['Space_Grotesk'] font-bold tracking-tighter uppercase leading-none">
              Portfolio Strategy
            </h1>
            <p className="text-[#C6C6C6] font-['Inter'] mt-4 max-w-xl text-sm leading-relaxed">
              Recommended positioning based on current supply chain stress conditions. High-fidelity synthesis of global transport vectors and industrial output.
            </p>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-[10px] text-[#C6C6C6] font-['Inter'] uppercase mb-1">SYSTEM_TIME:</span>
            <span className="text-xs font-['Space_Grotesk'] font-medium text-white">{systemTime}</span>
          </div>
        </div>
      </header>

      {/* ═══ Regime Context Banner ═══ */}
      {regime && (
        <section className="mb-12">
          <div className="bg-[#1B1B1B] p-8 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute right-0 top-0 h-full w-1/3 opacity-5 pointer-events-none">
              <div className="w-full h-full bg-gradient-to-l from-[#0F62FE] to-transparent" />
            </div>

            <div className="z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="px-3 py-1 bg-[#003DA9]/20 border border-[#0F62FE]/20">
                  <span className="text-[11px] font-['Inter'] font-bold text-[#0F62FE] tracking-widest uppercase">
                    REGIME: {regime.regime.toUpperCase()}
                  </span>
                </div>
                <span className="text-[#C6C6C6] text-[10px] font-['Inter'] tracking-widest uppercase">
                  GLOBAL SUPPLY STRESS INDEX
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-7xl font-['Space_Grotesk'] font-bold tracking-tighter">
                  {regime.gssiValue}
                </span>
                <span className="material-symbols-outlined text-[#0F62FE] text-4xl">
                  {trendIcon(regime.trendDirection)}
                </span>
              </div>
            </div>

            <div className="z-10 md:border-l border-[#474747]/15 md:pl-12 max-w-md">
              <p className="text-xs text-[#C6C6C6] leading-relaxed">
                {regime.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ═══ Allocation Signals (3 Tiers) ═══ */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-0 mb-16">
        {tiers.map(({ tier, items }) => {
          const config = tierConfig[tier]
          return (
            <div key={tier} className={cn(tierBg[tier], 'p-8', tier !== 'avoid' && 'border-r border-[#474747]/5')}>
              <div className="flex items-center justify-between mb-10">
                <h3 className={cn('text-xs font-["Space_Grotesk"] font-bold tracking-[0.2em] uppercase', config.headingColor)}>
                  {config.heading}
                </h3>
                <span className={cn('text-[10px] font-["Inter"] uppercase tracking-widest', config.tagColor)}>
                  {config.tag}
                </span>
              </div>
              <div className="space-y-12">
                {items.map((alloc) => (
                  <div key={alloc.id} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-2xl font-['Space_Grotesk'] font-bold text-white uppercase tracking-tight group-hover:text-[#0F62FE] transition-colors duration-150">
                        {alloc.sector}
                      </span>
                      <span className={cn(
                        'text-xs font-["Inter"]',
                        tier === 'avoid' ? 'text-[#FFB4AB]' : 'text-[#0F62FE]'
                      )}>
                        {alloc.confidence}% CONF.
                      </span>
                    </div>
                    <p className="text-[11px] text-[#C6C6C6] leading-relaxed">
                      {alloc.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </section>

      {/* ═══ Sector Impact Matrix ═══ */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xs font-['Space_Grotesk'] font-bold tracking-[0.25em] uppercase text-white">
            Sector_Impact_Matrix
          </h2>
          <div className="h-px flex-grow mx-8 bg-[#474747]/15" />
          <span className="text-[10px] font-['Inter'] text-[#C6C6C6] uppercase">FILTER: ALL_SECTORS</span>
        </div>

        <div className="space-y-[1px]">
          {/* Table Header */}
          <div className="grid grid-cols-6 px-4 py-3 text-[10px] font-['Inter'] font-bold text-[#C6C6C6] uppercase tracking-widest">
            <div className="col-span-2">Sector</div>
            <div>Sentiment</div>
            <div>Signal</div>
            <div>Volatility</div>
            <div className="text-right">Exposure</div>
          </div>

          {/* Data Rows */}
          {sectors?.map((sector, idx) => {
            const sent = sentimentConfig[sector.sentiment]
            const sig = signalConfig[sector.signal]
            return (
              <div
                key={sector.id}
                className="grid grid-cols-6 px-4 py-6 bg-[#1F1F1F] hover:bg-[#2A2A2A] transition-colors items-center"
              >
                <div className="col-span-2 flex items-center gap-4">
                  <span className="text-[9px] font-['Inter'] text-[#C6C6C6]">
                    {String(idx + 1).padStart(3, '0')}
                  </span>
                  <span className="text-sm font-['Space_Grotesk'] font-bold text-white uppercase tracking-tight">
                    {sector.sector}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', sent.dot)} />
                  <span className={cn('text-[11px] uppercase', sent.textColor)}>
                    {sent.label}
                  </span>
                </div>
                <div className={cn('flex items-center gap-1', sig.color)}>
                  <span className="material-symbols-outlined text-sm">{sig.icon}</span>
                  <span className="text-[11px] font-bold">{sig.label}</span>
                </div>
                <div className="text-[11px] text-[#C6C6C6] uppercase">
                  {sector.volatility}
                </div>
                <div className="text-right font-['Space_Grotesk'] text-white font-bold">
                  {sector.exposure.toFixed(1)}%
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ═══ Equity Exposure Terminal ═══ */}
      <section className="mb-16">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-['Space_Grotesk'] font-bold tracking-[0.25em] uppercase text-white">
              Equity_Exposure_Terminal
            </h2>
            <div className="h-px flex-grow mx-8 bg-[#474747]/15" />
            <span className="text-[10px] font-['Inter'] text-[#C6C6C6] uppercase">SYSTEM: ACTIVE</span>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              className="w-full bg-[#0E0E0E] border border-[#474747]/20 px-4 py-3 text-[10px] font-['Inter'] tracking-widest focus:ring-1 focus:ring-[#0F62FE] outline-none text-white uppercase placeholder:text-[#474747]/50"
              placeholder="SEARCH_BY_TICKER_OR_COMPANY..."
              type="text"
              value={equitySearch}
              onChange={(e) => setEquitySearch(e.target.value)}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#C6C6C6] text-sm">
              search
            </span>
          </div>

          <div className="space-y-[1px]">
            {/* Table Header */}
            <div className="grid grid-cols-5 px-4 py-3 text-[10px] font-['Inter'] font-bold text-[#C6C6C6] uppercase tracking-widest bg-[#1B1B1B]">
              <div>Ticker</div>
              <div>Company Name</div>
              <div className="text-center">Exposure Delta</div>
              <div className="text-center">GSSI Correlation</div>
              <div className="text-right">Sentiment</div>
            </div>

            {/* Data Rows */}
            {filteredEquities.map((eq) => {
              const sentiment = equitySentimentConfig[eq.sentiment]
              const deltaPositive = eq.exposureDelta > 0
              const deltaZero = eq.exposureDelta === 0

              return (
                <div
                  key={eq.id}
                  className="grid grid-cols-5 px-4 py-5 bg-[#1F1F1F] hover:bg-[#2A2A2A] transition-colors items-center group"
                >
                  <div className="font-['Space_Grotesk'] font-bold text-[#0F62FE] tracking-tight">
                    {eq.ticker}
                  </div>
                  <div className="text-xs text-white uppercase">{eq.companyName}</div>
                  <div className="flex justify-center items-center gap-2">
                    <span className={cn(
                      'material-symbols-outlined text-sm',
                      deltaPositive ? 'text-[#0F62FE]' : deltaZero ? 'text-[#C6C6C6]' : 'text-[#FFB4AB]'
                    )}>
                      {deltaPositive ? 'arrow_upward' : deltaZero ? 'horizontal_rule' : 'arrow_downward'}
                    </span>
                    <span className={cn(
                      'text-[11px] font-bold',
                      deltaPositive ? 'text-[#0F62FE]' : deltaZero ? 'text-[#C6C6C6]' : 'text-[#FFB4AB]'
                    )}>
                      {deltaPositive ? '+' : ''}{eq.exposureDelta.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-center text-xs text-[#C6C6C6] font-['Inter']">
                    {eq.gssiCorrelation.toFixed(1)}%
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      'text-[10px] px-2 py-0.5 border uppercase font-bold tracking-tighter',
                      sentiment.borderColor, sentiment.textColor
                    )}>
                      {sentiment.label}
                    </span>
                  </div>
                </div>
              )
            })}

            {filteredEquities.length === 0 && (
              <div className="py-8 text-center text-[#C6C6C6] text-xs font-['Inter'] uppercase tracking-widest">
                NO_MATCHES_FOUND
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ Key Drivers, Intelligence Feed & Protocols ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
        {/* Systemic Drivers */}
        <div className="lg:col-span-1 space-y-8">
          <h3 className="text-xs font-['Space_Grotesk'] font-bold tracking-[0.2em] uppercase text-white">
            Systemic_Drivers
          </h3>
          <div className="space-y-6">
            {drivers?.map((driver, idx) => (
              <div
                key={driver.id}
                className="p-5 bg-[#2A2A2A] hover:bg-[#353535] transition-colors cursor-default"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-['Inter'] font-bold text-[#0F62FE] uppercase tracking-widest">
                    DRIVER_{String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-[#C6C6C6] font-['Inter'] uppercase">
                    {driver.impactPercent}% IMPACT
                  </span>
                </div>
                <h4 className="text-lg font-['Space_Grotesk'] font-bold text-white uppercase mb-2">
                  {driver.name}
                </h4>
                <p className="text-[11px] text-[#C6C6C6] leading-relaxed">
                  {driver.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Intelligence Feed */}
        <div className="lg:col-span-1 space-y-8">
          <h3 className="text-xs font-['Space_Grotesk'] font-bold tracking-[0.2em] uppercase text-white">
            Strategic_Intelligence_Feed
          </h3>
          <div className="flex flex-col border border-[#474747]/15 bg-[#0E0E0E] divide-y divide-[#474747]/15">
            {intelligence?.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-[#1F1F1F] transition-colors cursor-pointer group"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-['Inter'] text-[#C6C6C6]">
                    {item.timestamp}
                  </span>
                  <span className="text-[9px] font-['Inter'] font-bold text-[#0F62FE]">
                    {item.source}
                  </span>
                </div>
                <h5 className="text-[11px] font-bold text-white leading-snug uppercase mb-2 group-hover:text-[#0F62FE] transition-colors">
                  {item.headline}
                </h5>
                <div className="inline-block px-1.5 py-0.5 bg-[#474747]/20 border border-[#474747]/30 text-[8px] font-['Inter'] text-[#C6C6C6] tracking-tighter">
                  [{item.tag}]
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Protocols */}
        <div className="lg:col-span-2 space-y-8">
          <h3 className="text-xs font-['Space_Grotesk'] font-bold tracking-[0.2em] uppercase text-white">
            Action_Protocols
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {protocols?.map((proto) => {
              const config = protocolConfig[proto.type]
              const isAlpha = proto.type === 'alpha'
              return (
                <div
                  key={proto.id}
                  className={cn(
                    'p-6 bg-[#353535]/60 backdrop-blur-xl border-l-2 hover:bg-[#353535] transition-all duration-200',
                    config.border
                  )}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={cn('px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase', config.badgeBg, config.badgeText)}>
                      {config.badge}
                    </div>
                    <span className="text-[10px] font-['Inter'] text-[#C6C6C6]">
                      CONF: {proto.confidence}%
                    </span>
                  </div>
                  <h4 className="text-2xl font-['Space_Grotesk'] font-bold text-white uppercase leading-tight mb-4 tracking-tighter">
                    {proto.title}
                  </h4>
                  <p className="text-xs text-[#C6C6C6] leading-relaxed mb-2">
                    {proto.description}
                  </p>
                  <p className="text-[9px] text-[#474747] uppercase tracking-widest mb-6">
                    HORIZON: {proto.horizon}
                  </p>
                  <button className={cn(
                    'w-full py-3 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors duration-200',
                    isAlpha
                      ? 'bg-white text-black hover:bg-[#0F62FE] hover:text-white'
                      : 'border border-white/20 text-white hover:bg-white hover:text-black'
                  )}>
                    {proto.actionLabel}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Ambient Shadow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#0F62FE]/5 blur-[120px] rounded-full pointer-events-none -z-10" />
    </AppShell>
  )
}
