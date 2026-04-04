import type { ForecastPoint } from '@/types/domain'

export const forecastMock: ForecastPoint[] = [
  { date: '2023-06', actual: 60, forecast: null },
  { date: '2023-07', actual: 68, forecast: null },
  { date: '2023-08', actual: 72, forecast: 72 }, // Current / connection point
  { date: '2023-09', actual: null, forecast: 75 },
  { date: '2023-10', actual: null, forecast: 78 },
  { date: '2023-11', actual: null, forecast: 80 },
]
