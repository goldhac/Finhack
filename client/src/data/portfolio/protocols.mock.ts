import type { ActionProtocol } from '@/types/portfolio'

export const protocolsMock: ActionProtocol[] = [
  {
    id: 'proto-1',
    type: 'alpha',
    confidence: 94,
    title: 'Increase Exposure: Global Energy',
    description:
      'Capitalize on structural supply deficits. Target North American LNG providers and midstream infrastructure.',
    horizon: '12-18 months',
    actionLabel: 'EXECUTE_TRADE',
  },
  {
    id: 'proto-2',
    type: 'defense',
    confidence: 82,
    title: 'Reduce Exposure: Retail Tech',
    description:
      'Exit positions sensitive to consumer electronics supply chains. Anticipated margin compression in Q4.',
    horizon: 'Immediate',
    actionLabel: 'INITIATE_EXIT',
  },
  {
    id: 'proto-3',
    type: 'hedge',
    confidence: 76,
    title: 'Hedge: Freight Rate Volatility',
    description:
      'Implement derivative overlay on container shipping exposure. Baltic Dry Index forward contracts recommended.',
    horizon: '3-6 months',
    actionLabel: 'SET_HEDGE',
  },
  {
    id: 'proto-4',
    type: 'rebalance',
    confidence: 71,
    title: 'Rebalance: Industrial Allocation',
    description:
      'Shift weight from broad industrial ETFs to targeted reshoring beneficiaries. Focus on domestic steel and infrastructure.',
    horizon: '6-12 months',
    actionLabel: 'REBALANCE',
  },
]
