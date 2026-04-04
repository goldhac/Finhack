import type { IntelligenceItem } from '@/types/portfolio'

export const intelligenceMock: IntelligenceItem[] = [
  {
    id: 'intel-1',
    timestamp: '14:02 UTC',
    source: 'REUTERS',
    headline:
      'Panama Canal transit restrictions extended through Q1 due to drought conditions.',
    tag: 'LOGISTICS_FRICTION',
  },
  {
    id: 'intel-2',
    timestamp: '13:45 UTC',
    source: 'BLOOMBERG',
    headline:
      'European gas storage levels hit 92% ahead of peak winter demand cycle.',
    tag: 'ENERGY_RESERVES',
  },
  {
    id: 'intel-3',
    timestamp: '12:20 UTC',
    source: 'SIGNAL_GPT',
    headline:
      'West Coast labor negotiations reach impasse; localized strikes probable.',
    tag: 'PORT_STRIKE',
  },
  {
    id: 'intel-4',
    timestamp: '11:10 UTC',
    source: 'FIN_TIMES',
    headline:
      'Maritime freight index shows 4th consecutive weekly rise in TEU pricing.',
    tag: 'CONTAINER_INDEX',
  },
  {
    id: 'intel-5',
    timestamp: '09:30 UTC',
    source: 'CHAINPULSE',
    headline:
      'GSSI sub-index for Asia-Pacific trade routes breaches 80-threshold for first time in Q4.',
    tag: 'APAC_STRESS',
  },
]
