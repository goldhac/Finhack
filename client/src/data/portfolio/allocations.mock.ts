import type { AllocationSignal } from '@/types/portfolio'

export const allocationsMock: AllocationSignal[] = [
  {
    id: 'alloc-1',
    sector: 'Energy',
    tier: 'overweight',
    confidence: 92,
    rationale:
      'Supply bottlenecks in maritime oil transport favor regional production hubs. High pricing power remains dominant.',
  },
  {
    id: 'alloc-2',
    sector: 'Industrials',
    tier: 'overweight',
    confidence: 84,
    rationale:
      'Focus on domestic heavy manufacturing infrastructure. Reshoring initiatives are accelerating capital inflow.',
  },
  {
    id: 'alloc-3',
    sector: 'Consumer',
    tier: 'neutral',
    confidence: 65,
    rationale:
      'Stable demand offset by rising last-mile delivery costs. Maintain existing positions pending Q4 retail volume data.',
  },
  {
    id: 'alloc-4',
    sector: 'Healthcare',
    tier: 'neutral',
    confidence: 71,
    rationale:
      'Biotech logistics normalized. Limited exposure to current supply chain friction in core pharmaceutical segments.',
  },
  {
    id: 'alloc-5',
    sector: 'Tech',
    tier: 'avoid',
    confidence: 88,
    rationale:
      'Semiconductor delivery lead times extending to 42 weeks. Input cost escalation eroding margin forecasts.',
  },
  {
    id: 'alloc-6',
    sector: 'Logistics',
    tier: 'avoid',
    confidence: 79,
    rationale:
      'Extreme volatility in freight rates creates unsustainable margin profiles for asset-heavy operators.',
  },
]
