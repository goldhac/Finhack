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

export const gssiService = {
  getSummary:         () => apiFetch<OverviewSummary>('/gssi/summary'),
  getHistory:         () => apiFetch<TrendPoint[]>('/gssi/history'),
  getForecast:        () => apiFetch<ForecastPoint[]>('/gssi/forecast'),
  getDrivers:         () => apiFetch<DriverBucket[]>('/gssi/drivers'),
  getImplications:    () => apiFetch<MarketImplication[]>('/gssi/implications'),
  getRecommendations: () => apiFetch<Recommendation[]>('/gssi/recommendations'),
  getValidation:      () => apiFetch<{ validation: ValidationData; forecast_meta: Record<string, unknown> }>('/gssi/validation'),
  getRefreshStatus:   () => apiFetch<RefreshStatus>('/gssi/refresh-status'),
}
