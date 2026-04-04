import type { DriverBucket } from '@/types/domain'

export const driversMock: DriverBucket[] = [
  { id: 'transport', name: 'Transport', score: 65, contribution: 20, status: 'worsening' },
  { id: 'congestion', name: 'Congestion', score: 55, contribution: 15, status: 'stable' },
  { id: 'energy', name: 'Energy', score: 90, contribution: 35, status: 'worsening' },
  { id: 'trade', name: 'Trade', score: 60, contribution: 18, status: 'improving' },
  { id: 'inventory', name: 'Inventory', score: 45, contribution: 12, status: 'stable' },
]
