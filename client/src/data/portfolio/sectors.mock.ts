import type { SectorImpact } from '@/types/portfolio'

export const sectorsMock: SectorImpact[] = [
  {
    id: 'sec-1',
    sector: 'Energy & Utilities',
    sentiment: 'bullish',
    signal: 'positive',
    volatility: 'medium',
    exposure: 14.2,
  },
  {
    id: 'sec-2',
    sector: 'Industrials',
    sentiment: 'bullish',
    signal: 'positive',
    volatility: 'high',
    exposure: 11.8,
  },
  {
    id: 'sec-3',
    sector: 'Consumer Goods',
    sentiment: 'neutral',
    signal: 'neutral',
    volatility: 'low',
    exposure: 8.4,
  },
  {
    id: 'sec-4',
    sector: 'Technology',
    sentiment: 'bearish',
    signal: 'negative',
    volatility: 'extreme',
    exposure: 4.1,
  },
  {
    id: 'sec-5',
    sector: 'Healthcare',
    sentiment: 'neutral',
    signal: 'neutral',
    volatility: 'low',
    exposure: 9.6,
  },
  {
    id: 'sec-6',
    sector: 'Materials',
    sentiment: 'bullish',
    signal: 'positive',
    volatility: 'medium',
    exposure: 7.3,
  },
]
