import type { StressRegime } from './domain'

/* ── Regime Context ── */
export interface RegimeContext {
  gssiValue: number
  regime: StressRegime
  trendDirection: 'up' | 'down' | 'flat'
  deltaPercent: number
  description: string
}

/* ── Allocation Signal ── */
export type AllocationTier = 'overweight' | 'neutral' | 'avoid'

export interface AllocationSignal {
  id: string
  sector: string
  tier: AllocationTier
  confidence: number
  rationale: string
}

/* ── Sector Impact ── */
export type SectorSentiment = 'bullish' | 'neutral' | 'bearish'
export type SignalDirection = 'positive' | 'neutral' | 'negative'
export type VolatilityLevel = 'low' | 'medium' | 'high' | 'extreme'

export interface SectorImpact {
  id: string
  sector: string
  sentiment: SectorSentiment
  signal: SignalDirection
  volatility: VolatilityLevel
  exposure: number
}

/* ── Equity Exposure ── */
export type EquitySentiment = 'positive' | 'neutral' | 'negative' | 'high_conviction'

export interface EquityExposure {
  id: string
  ticker: string
  companyName: string
  exposureDelta: number
  gssiCorrelation: number
  sentiment: EquitySentiment
}

/* ── Systemic Driver ── */
export interface SystemicDriver {
  id: string
  name: string
  impactPercent: number
  description: string
}

/* ── Intelligence Feed Item ── */
export interface IntelligenceItem {
  id: string
  timestamp: string
  source: string
  headline: string
  tag: string
}

/* ── Action Protocol ── */
export type ProtocolType = 'alpha' | 'defense' | 'hedge' | 'rebalance'

export interface ActionProtocol {
  id: string
  type: ProtocolType
  confidence: number
  title: string
  description: string
  horizon: string
  actionLabel: string
}
