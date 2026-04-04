import type { SystemicDriver } from '@/types/portfolio'

export const systemicDriversMock: SystemicDriver[] = [
  {
    id: 'drv-1',
    name: 'Transport Costs',
    impactPercent: 88,
    description:
      'Maritime fuel surcharges and container availability issues are the primary catalysts for current strategy re-weighting.',
  },
  {
    id: 'drv-2',
    name: 'Port Congestion',
    impactPercent: 74,
    description:
      'Wait times in Long Beach and Rotterdam are expanding, impacting Just-In-Time manufacturing inventories.',
  },
  {
    id: 'drv-3',
    name: 'Energy Pricing',
    impactPercent: 68,
    description:
      'Crude oil forward curve in contango. Natural gas spot prices elevated in European markets.',
  },
]
