import { apiFetch } from '@/lib/api'
import type {
  OverviewSummary,
  TrendPoint,
  ForecastPoint,
  DriverBucket,
  MarketImplication,
  Recommendation,
} from '@/types/domain'

export interface ValidationData {
  holdout_months: number
  mae_naive: number
  mae_holtwinters: number
  mae_xgboost: number
  best_model: string
  beat_naive: boolean
  mae_by_horizon: Record<string, { naive: number; holtwinters: number; xgboost: number }>
}

export interface RefreshStatus {
  timestamp_utc: string | null
  pipeline_exit_code: number | null
  fred_series_refreshed?: string[]
  gscpi_source?: string
  message?: string
}

export interface BacktestYearSeries {
  date: string
  forecast: number
  actual: number | null
}

export interface BacktestYear {
  year: number
  origin_date: string
  train_months: number
  mae: number | null
  n_actual: number
  color: string
  series: BacktestYearSeries[]
}

export interface BacktestResults {
  model: string
  horizon_months: number
  years: BacktestYear[]
  actual_context: { date: string; actual: number }[]
}

export const gssiService = {
  getSummary:         () => apiFetch<OverviewSummary>('/gssi/summary'),
  getHistory:         () => apiFetch<TrendPoint[]>('/gssi/history'),
  getForecast:        () => apiFetch<ForecastPoint[]>('/gssi/forecast'),
  getDrivers:         () => apiFetch<DriverBucket[]>('/gssi/drivers'),
  getImplications:    () => apiFetch<MarketImplication[]>('/gssi/implications'),
  getRecommendations: () => apiFetch<Recommendation[]>('/gssi/recommendations'),
  getValidation:      () => apiFetch<{ validation: ValidationData; forecast_meta: Record<string, unknown> }>('/gssi/validation'),
  getRefreshStatus:   () => apiFetch<RefreshStatus>('/gssi/refresh-status'),
  getBacktest:        () => apiFetch<BacktestResults>('/gssi/backtest'),
}
