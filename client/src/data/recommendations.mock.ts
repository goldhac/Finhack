import type { Recommendation } from '@/types/domain'

export const recommendationsMock: Recommendation[] = [
  {
    id: 'rec-1',
    action: 'Hedge Energy Exposure',
    rationale: 'Energy buckets are at critical levels, contributing 35% of total current stress.',
    confidence: 'High',
  },
  {
    id: 'rec-2',
    action: 'Increase Safety Stock',
    rationale: 'Projected 1-Month forecast shows stress worsening to 75; buffer against potential friction.',
    confidence: 'Medium',
  },
  {
    id: 'rec-3',
    action: 'Monitor Core Trade Lanes',
    rationale: 'Trade is improving, but secondary network ripples could persist into Q3.',
    confidence: 'Low',
  },
]
