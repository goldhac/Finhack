import type { EquityExposure } from '@/types/portfolio'

export const equitiesMock: EquityExposure[] = [
  {
    id: 'eq-1',
    ticker: '$UPS',
    companyName: 'United Parcel Service',
    exposureDelta: -2.4,
    gssiCorrelation: 92.4,
    sentiment: 'negative',
  },
  {
    id: 'eq-2',
    ticker: '$XOM',
    companyName: 'Exxon Mobil Corp',
    exposureDelta: 5.1,
    gssiCorrelation: 76.8,
    sentiment: 'positive',
  },
  {
    id: 'eq-3',
    ticker: '$NVDA',
    companyName: 'NVIDIA Corporation',
    exposureDelta: 0.0,
    gssiCorrelation: 41.2,
    sentiment: 'neutral',
  },
  {
    id: 'eq-4',
    ticker: '$MAERSK',
    companyName: 'A.P. Moller-Maersk',
    exposureDelta: 8.7,
    gssiCorrelation: 98.9,
    sentiment: 'high_conviction',
  },
  {
    id: 'eq-5',
    ticker: '$CAT',
    companyName: 'Caterpillar Inc',
    exposureDelta: 3.2,
    gssiCorrelation: 81.3,
    sentiment: 'positive',
  },
  {
    id: 'eq-6',
    ticker: '$INTC',
    companyName: 'Intel Corporation',
    exposureDelta: -4.7,
    gssiCorrelation: 67.9,
    sentiment: 'negative',
  },
]
