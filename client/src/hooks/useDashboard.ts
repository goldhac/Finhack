import { useQuery } from '@tanstack/react-query'
import { gssiService } from '@/services/gssi.service'

const STALE_TIME = 5 * 60 * 1000  // 5 minutes — pipeline output doesn't change second-to-second

export function useDashboard() {
  const summaryQuery = useQuery({
    queryKey: ['gssi', 'summary'],
    queryFn: gssiService.getSummary,
    staleTime: STALE_TIME,
    retry: 2,
  })

  const historyQuery = useQuery({
    queryKey: ['gssi', 'history'],
    queryFn: gssiService.getHistory,
    staleTime: STALE_TIME,
    retry: 2,
  })

  const forecastQuery = useQuery({
    queryKey: ['gssi', 'forecast'],
    queryFn: gssiService.getForecast,
    staleTime: STALE_TIME,
    retry: 2,
  })

  const driversQuery = useQuery({
    queryKey: ['gssi', 'drivers'],
    queryFn: gssiService.getDrivers,
    staleTime: STALE_TIME,
    retry: 2,
  })

  const implicationsQuery = useQuery({
    queryKey: ['gssi', 'implications'],
    queryFn: gssiService.getImplications,
    staleTime: STALE_TIME,
    retry: 2,
  })

  const recommendationsQuery = useQuery({
    queryKey: ['gssi', 'recommendations'],
    queryFn: gssiService.getRecommendations,
    staleTime: STALE_TIME,
    retry: 2,
  })

  const validationQuery = useQuery({
    queryKey: ['gssi', 'validation'],
    queryFn: gssiService.getValidation,
    staleTime: STALE_TIME,
    retry: 2,
  })

  const refreshStatusQuery = useQuery({
    queryKey: ['gssi', 'refresh-status'],
    queryFn: gssiService.getRefreshStatus,
    staleTime: 60 * 1000,  // refresh status checked every minute
    retry: 1,
  })

  return {
    summary:         summaryQuery,
    history:         historyQuery,
    forecast:        forecastQuery,
    drivers:         driversQuery,
    implications:    implicationsQuery,
    recommendations: recommendationsQuery,
    validation:      validationQuery,
    refreshStatus:   refreshStatusQuery,
  }
}
