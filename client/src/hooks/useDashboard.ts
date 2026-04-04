import { useQuery } from '@tanstack/react-query'

import { summaryMock } from '@/data/summary.mock'
import { historyMock } from '@/data/history.mock'
import { forecastMock } from '@/data/forecast.mock'
import { driversMock } from '@/data/drivers.mock'
import { implicationsMock } from '@/data/implications.mock'
import { recommendationsMock } from '@/data/recommendations.mock'

export function useDashboard() {
  const summaryQuery = useQuery({
    queryKey: ['summary'],
    queryFn: () => Promise.resolve(summaryMock),
  })

  const historyQuery = useQuery({
    queryKey: ['history'],
    queryFn: () => Promise.resolve(historyMock),
  })

  const forecastQuery = useQuery({
    queryKey: ['forecast'],
    queryFn: () => Promise.resolve(forecastMock),
  })

  const driversQuery = useQuery({
    queryKey: ['drivers'],
    queryFn: () => Promise.resolve(driversMock),
  })

  const implicationsQuery = useQuery({
    queryKey: ['implications'],
    queryFn: () => Promise.resolve(implicationsMock),
  })

  const recommendationsQuery = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => Promise.resolve(recommendationsMock),
  })

  return {
    summary: summaryQuery,
    history: historyQuery,
    forecast: forecastQuery,
    drivers: driversQuery,
    implications: implicationsQuery,
    recommendations: recommendationsQuery,
  }
}
