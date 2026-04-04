import { useQuery } from '@tanstack/react-query'
import type {
  RegimeContext,
  AllocationSignal,
  SectorImpact,
  EquityExposure,
  SystemicDriver,
  IntelligenceItem,
  ActionProtocol,
} from '@/types/portfolio'

import { regimeContextMock } from '@/data/portfolio/regime.mock'
import { allocationsMock } from '@/data/portfolio/allocations.mock'
import { sectorsMock } from '@/data/portfolio/sectors.mock'
import { equitiesMock } from '@/data/portfolio/equities.mock'
import { systemicDriversMock } from '@/data/portfolio/drivers.mock'
import { intelligenceMock } from '@/data/portfolio/intelligence.mock'
import { protocolsMock } from '@/data/portfolio/protocols.mock'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Swap these fetchers for real API calls when ready
async function fetchRegime(): Promise<RegimeContext> {
  await delay(300)
  return regimeContextMock
}
async function fetchAllocations(): Promise<AllocationSignal[]> {
  await delay(300)
  return allocationsMock
}
async function fetchSectors(): Promise<SectorImpact[]> {
  await delay(300)
  return sectorsMock
}
async function fetchEquities(): Promise<EquityExposure[]> {
  await delay(300)
  return equitiesMock
}
async function fetchDrivers(): Promise<SystemicDriver[]> {
  await delay(300)
  return systemicDriversMock
}
async function fetchIntelligence(): Promise<IntelligenceItem[]> {
  await delay(300)
  return intelligenceMock
}
async function fetchProtocols(): Promise<ActionProtocol[]> {
  await delay(300)
  return protocolsMock
}

export function usePortfolio() {
  const regime = useQuery({ queryKey: ['portfolio', 'regime'], queryFn: fetchRegime })
  const allocations = useQuery({ queryKey: ['portfolio', 'allocations'], queryFn: fetchAllocations })
  const sectors = useQuery({ queryKey: ['portfolio', 'sectors'], queryFn: fetchSectors })
  const equities = useQuery({ queryKey: ['portfolio', 'equities'], queryFn: fetchEquities })
  const drivers = useQuery({ queryKey: ['portfolio', 'drivers'], queryFn: fetchDrivers })
  const intelligence = useQuery({ queryKey: ['portfolio', 'intelligence'], queryFn: fetchIntelligence })
  const protocols = useQuery({ queryKey: ['portfolio', 'protocols'], queryFn: fetchProtocols })

  const isLoading =
    regime.isLoading ||
    allocations.isLoading ||
    sectors.isLoading ||
    equities.isLoading ||
    drivers.isLoading ||
    intelligence.isLoading ||
    protocols.isLoading

  const isError =
    regime.isError ||
    allocations.isError ||
    sectors.isError ||
    equities.isError ||
    drivers.isError ||
    intelligence.isError ||
    protocols.isError

  return {
    isLoading,
    isError,
    regime: regime.data,
    allocations: allocations.data,
    sectors: sectors.data,
    equities: equities.data,
    drivers: drivers.data,
    intelligence: intelligence.data,
    protocols: protocols.data,
  }
}
