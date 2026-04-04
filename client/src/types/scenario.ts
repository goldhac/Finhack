// ── Scenario Simulation Types ──

export interface ScenarioInput {
  prompt: string
  currentData?: {
    gssi: number
    regime: string
    drivers?: {
      energy: number
      transport: number
      trade: number
      congestion: number
      inventory: number
    }
  }
}

export interface FactorDelta {
  factor: string
  baselineWeight: number
  projectedWeight: number
  delta: number
  rationale: string
}

export interface SectorImpact {
  sector: string
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  magnitude: 'LOW' | 'MEDIUM' | 'HIGH'
  rationale: string
}

export interface PortfolioAction {
  action: 'OVERWEIGHT' | 'UNDERWEIGHT' | 'HEDGE' | 'MONITOR' | 'EXIT'
  asset: string
  urgency: 'IMMEDIATE' | 'SHORT_TERM' | 'WATCH'
  confidence: number
  rationale: string
}

export interface ScenarioResult {
  scenarioTitle: string
  summary: string
  baseline: {
    gssi: number
    regime: string
  }
  projected: {
    gssi: number
    regime: string
    confidence: number
    timeHorizon: string
  }
  factorDeltas: FactorDelta[]
  sectorImpact: SectorImpact[]
  portfolioActions: PortfolioAction[]
  cascadeNarrative: string
}
