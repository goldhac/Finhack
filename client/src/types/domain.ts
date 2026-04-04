export type StressRegime = 'low' | 'elevated' | 'high' | 'critical'

export interface OverviewSummary {
  currentGSSI: number
  stressRegime: StressRegime
  forecast1Month: number
  forecast3Month: number
  forecast3MonthProbability: number
  trendDirection: 'up' | 'down' | 'flat'
}

export interface TrendPoint {
  date: string
  value: number
}

export interface ForecastPoint {
  date: string
  actual: number | null
  forecast: number | null
  lower_80?: number | null
  upper_80?: number | null
  lower_95?: number | null
  upper_95?: number | null
  probability?: number
}

export interface DriverBucket {
  id: string
  name: string
  score: number
  contribution: number
  status: 'improving' | 'worsening' | 'stable'
}

export interface MarketImplication {
  id: string
  theme: string
  impact: 'positive' | 'negative' | 'neutral'
  description: string
}

export interface Recommendation {
  id: string
  action: string
  rationale: string
  confidence?: 'Low' | 'Medium' | 'High'
}
