import type { MarketImplication } from '@/types/domain'

export const implicationsMock: MarketImplication[] = [
  {
    id: 'impl-1',
    theme: 'Inflation',
    impact: 'negative',
    description: 'Elevated energy constraint signaling cost-push inflation pass-through risk.',
  },
  {
    id: 'impl-2',
    theme: 'Commodities',
    impact: 'negative',
    description: 'Energy pressure driving up broader intermediate material costs.',
  },
  {
    id: 'impl-3',
    theme: 'Risk',
    impact: 'neutral',
    description: 'General volatility and transport bottlenecks are contained, partially offsetting energy.',
  },
]
