# ChainPulse — Data Integration Guide

> This guide tells you **exactly** what to change to replace the mock/dummy data with real production data. Every mock file, every hook, and every API route is documented with the precise interface contract you must satisfy.

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Dashboard Data Layer](#2-dashboard-data-layer)
3. [Portfolio Data Layer](#3-portfolio-data-layer)
4. [Scenario Simulator (Backend)](#4-scenario-simulator-backend)
5. [Cisco AI Analyst (Backend)](#5-cisco-ai-analyst-backend)
6. [Environment Variables](#6-environment-variables)
7. [Adding a Real API](#7-adding-a-real-api)
8. [Type Reference](#8-type-reference)

---

## 1. Quick Start

The entire data layer is designed for a **single-point swap**. Every page reads data through a custom hook, and every hook currently resolves from local mock files. To go live:

1. **Build your API endpoints** that return JSON matching the interfaces below
2. **Replace the `queryFn` in each hook** to call your API instead of returning mock data
3. **Set environment variables** for API keys and endpoints
4. **Remove mock files** (optional — keeping them is fine for fallback/testing)

### Architecture Diagram

```
┌─────────────────────────────────────────────┐
│                 FRONTEND                     │
│                                             │
│   Page Component                            │
│        ↓                                    │
│   Custom Hook (useXxx)                      │
│        ↓                                    │
│   React Query (queryFn)                     │
│        ↓                     ↓              │
│   *.mock.ts (current)   fetch('/api/xxx')   │
│   ← REMOVE THIS             ← ADD THIS     │
└─────────────────────────────────────────────┘
```

---

## 2. Dashboard Data Layer

**Hook:** `client/src/hooks/useDashboard.ts`  
**Currently:** Imports 6 mock files and wraps them in `Promise.resolve()`  

### What To Change

Replace each `queryFn` with a real API call. Example transformation:

```typescript
// ❌ BEFORE (mock)
const summaryQuery = useQuery({
  queryKey: ['summary'],
  queryFn: () => Promise.resolve(summaryMock),
})

// ✅ AFTER (real API)
const summaryQuery = useQuery({
  queryKey: ['summary'],
  queryFn: () => fetch('/api/dashboard/summary').then(r => r.json()),
  staleTime: 60_000,       // Cache for 1 minute
  refetchInterval: 300_000, // Refresh every 5 minutes
})
```

### Mock Files & Required Interfaces

---

### 2.1 Overview Summary

**Mock File:** `client/src/data/summary.mock.ts`  
**Type:** `OverviewSummary`  

Your API must return:

```json
{
  "currentGSSI": 72,
  "stressRegime": "elevated",
  "forecast1Month": 75,
  "forecast3Month": 80,
  "forecast3MonthProbability": 0.65,
  "trendDirection": "up"
}
```

| Field | Type | Values | Description |
|---|---|---|---|
| `currentGSSI` | `number` | 0–100 | The current Global Supply Chain Stress Index score |
| `stressRegime` | `string` | `"low"` \| `"elevated"` \| `"high"` \| `"critical"` | Current stress classification |
| `forecast1Month` | `number` | 0–100 | Projected GSSI in 1 month |
| `forecast3Month` | `number` | 0–100 | Projected GSSI in 3 months |
| `forecast3MonthProbability` | `number` | 0.0–1.0 | Confidence probability for the 3-month forecast |
| `trendDirection` | `string` | `"up"` \| `"down"` \| `"flat"` | Current directional trend |

**Data Source Ideas:** Composite index from freight indices (BDI, SCFI), energy prices (WTI, Brent, Henry Hub), port congestion data, PMI indicators.

---

### 2.2 Historical Trend

**Mock File:** `client/src/data/history.mock.ts`  
**Type:** `TrendPoint[]`  

Your API must return an array:

```json
[
  { "date": "2023-01", "value": 42 },
  { "date": "2023-02", "value": 45 },
  ...
]
```

| Field | Type | Description |
|---|---|---|
| `date` | `string` | Date label (format: `YYYY-MM` for monthly, `YYYY-MM-DD` for daily) |
| `value` | `number` | GSSI score at that date (0–100) |

**Minimum:** 6 data points. **Recommended:** 12–24 months of history.

**Data Source Ideas:** Your own computed GSSI historical values, or backfilled from public freight/energy indices.

---

### 2.3 Forecast

**Mock File:** `client/src/data/forecast.mock.ts`  
**Type:** `ForecastPoint[]`  

```json
[
  { "date": "2023-06", "actual": 60, "forecast": null },
  { "date": "2023-07", "actual": 68, "forecast": null },
  { "date": "2023-08", "actual": 72, "forecast": 72 },
  { "date": "2023-09", "actual": null, "forecast": 75 },
  { "date": "2023-10", "actual": null, "forecast": 78 }
]
```

| Field | Type | Description |
|---|---|---|
| `date` | `string` | Date label |
| `actual` | `number \| null` | Historical actual value. `null` for future dates |
| `forecast` | `number \| null` | Forecasted value. `null` for past dates. The "connection point" has both |

**Important:** The chart draws two lines — `actual` (solid) and `forecast` (dashed). The transition point where both values exist creates the visual handoff.

**Data Source Ideas:** Time-series forecasting model (ARIMA, Prophet, LSTM) trained on your historical GSSI.

---

### 2.4 Driver Decomposition

**Mock File:** `client/src/data/drivers.mock.ts`  
**Type:** `DriverBucket[]`  

```json
[
  { "id": "energy", "name": "Energy", "score": 90, "contribution": 35, "status": "worsening" },
  { "id": "transport", "name": "Transport", "score": 65, "contribution": 20, "status": "worsening" },
  { "id": "trade", "name": "Trade", "score": 60, "contribution": 18, "status": "improving" },
  { "id": "congestion", "name": "Congestion", "score": 55, "contribution": 15, "status": "stable" },
  { "id": "inventory", "name": "Inventory", "score": 45, "contribution": 12, "status": "stable" }
]
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique driver ID |
| `name` | `string` | Display name |
| `score` | `number` | Individual stress score (0–100) |
| `contribution` | `number` | Percentage contribution to overall GSSI. **Must sum to 100** |
| `status` | `string` | `"improving"` \| `"worsening"` \| `"stable"` |

**Data Source Ideas:** Weighted sub-indices. Energy = crude + LNG + electricity spot. Transport = BDI + Freightos + trucking. Trade = tariff indices + PMI export orders. Congestion = port dwell times. Inventory = ISM inventories sub-index.

---

### 2.5 Market Implications

**Mock File:** `client/src/data/implications.mock.ts`  
**Type:** `MarketImplication[]`  

```json
[
  {
    "id": "impl-1",
    "theme": "Inflation",
    "impact": "negative",
    "description": "Elevated energy constraint signaling cost-push inflation pass-through risk."
  }
]
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique ID |
| `theme` | `string` | Macro theme (e.g., "Inflation", "Commodities", "Risk", "Growth") |
| `impact` | `string` | `"positive"` \| `"negative"` \| `"neutral"` |
| `description` | `string` | 1–2 sentence explanation |

**Recommended:** 3–5 implications. Can be AI-generated from driver data or manually curated.

---

### 2.6 Recommendations

**Mock File:** `client/src/data/recommendations.mock.ts`  
**Type:** `Recommendation[]`  

```json
[
  {
    "id": "rec-1",
    "action": "Hedge Energy Exposure",
    "rationale": "Energy buckets are at critical levels, contributing 35% of total current stress.",
    "confidence": "High"
  }
]
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique ID |
| `action` | `string` | Actionable directive |
| `rationale` | `string` | Supporting reasoning |
| `confidence` | `string` | `"Low"` \| `"Medium"` \| `"High"` (optional) |

---

## 3. Portfolio Data Layer

**Hook:** `client/src/hooks/usePortfolio.ts`  
**Currently:** Imports 7 mock files, wraps each in a `300ms delay + Promise.resolve()`

### What To Change

Same pattern as Dashboard — replace each async fetcher function:

```typescript
// ❌ BEFORE
async function fetchRegime(): Promise<RegimeContext> {
  await delay(300)
  return regimeContextMock
}

// ✅ AFTER
async function fetchRegime(): Promise<RegimeContext> {
  const res = await fetch('/api/portfolio/regime')
  return res.json()
}
```

### Mock Files & Required Interfaces

---

### 3.1 Regime Context

**Mock File:** `client/src/data/portfolio/regime.mock.ts`

```json
{
  "gssiValue": 72,
  "regime": "elevated",
  "trendDirection": "up",
  "deltaPercent": 14,
  "description": "The current GSSI reading indicates a 14% increase in systemic friction..."
}
```

---

### 3.2 Allocation Signals

**Mock File:** `client/src/data/portfolio/allocations.mock.ts`

```json
[
  {
    "id": "alloc-1",
    "sector": "Energy",
    "tier": "overweight",
    "confidence": 92,
    "rationale": "Supply bottlenecks in maritime oil transport favor regional production hubs."
  }
]
```

| Field | Type | Values |
|---|---|---|
| `tier` | `string` | `"overweight"` \| `"neutral"` \| `"avoid"` |
| `confidence` | `number` | 0–100 |

---

### 3.3 Sector Impact

**Mock File:** `client/src/data/portfolio/sectors.mock.ts`

```json
[
  {
    "id": "sec-1",
    "sector": "Energy & Utilities",
    "sentiment": "bullish",
    "signal": "positive",
    "volatility": "medium",
    "exposure": 14.2
  }
]
```

| Field | Type | Values |
|---|---|---|
| `sentiment` | `string` | `"bullish"` \| `"neutral"` \| `"bearish"` |
| `signal` | `string` | `"positive"` \| `"neutral"` \| `"negative"` |
| `volatility` | `string` | `"low"` \| `"medium"` \| `"high"` \| `"extreme"` |
| `exposure` | `number` | Portfolio weight percentage |

---

### 3.4 Equity Exposures

**Mock File:** `client/src/data/portfolio/equities.mock.ts`

```json
[
  {
    "id": "eq-1",
    "ticker": "$XOM",
    "companyName": "Exxon Mobil Corp",
    "exposureDelta": 5.1,
    "gssiCorrelation": 76.8,
    "sentiment": "positive"
  }
]
```

| Field | Type | Values |
|---|---|---|
| `exposureDelta` | `number` | Signed change in exposure (e.g., +5.1 or -2.4) |
| `gssiCorrelation` | `number` | 0–100, how correlated with GSSI |
| `sentiment` | `string` | `"positive"` \| `"neutral"` \| `"negative"` \| `"high_conviction"` |

---

### 3.5 Systemic Drivers

**Mock File:** `client/src/data/portfolio/drivers.mock.ts`

```json
[
  {
    "id": "drv-1",
    "name": "Transport Costs",
    "impactPercent": 88,
    "description": "Maritime fuel surcharges and container availability issues..."
  }
]
```

---

### 3.6 Intelligence Feed

**Mock File:** `client/src/data/portfolio/intelligence.mock.ts`

```json
[
  {
    "id": "intel-1",
    "timestamp": "14:02 UTC",
    "source": "REUTERS",
    "headline": "Panama Canal transit restrictions extended through Q1...",
    "tag": "LOGISTICS_FRICTION"
  }
]
```

**Data Source Ideas:** RSS feeds from Reuters, Bloomberg, FT; or a news aggregation API filtered for supply chain / macro keywords.

---

### 3.7 Action Protocols

**Mock File:** `client/src/data/portfolio/protocols.mock.ts`

```json
[
  {
    "id": "proto-1",
    "type": "alpha",
    "confidence": 94,
    "title": "Increase Exposure: Global Energy",
    "description": "Capitalize on structural supply deficits...",
    "horizon": "12-18 months",
    "actionLabel": "EXECUTE_TRADE"
  }
]
```

| Field | Type | Values |
|---|---|---|
| `type` | `string` | `"alpha"` \| `"defense"` \| `"hedge"` \| `"rebalance"` |
| `actionLabel` | `string` | Button label text |

---

## 4. Scenario Simulator (Backend)

**File:** `server/src/routes/scenarios.ts`  
**Endpoint:** `POST /api/scenarios/simulate`

### Current Behavior
Takes a user prompt + baseline GSSI data, sends it to Gemini 2.5 Flash with a structured system prompt, and returns a detailed `ScenarioResult` JSON.

### What To Change
**Nothing required** — this already uses a real AI backend. If you want to change the model:

```typescript
// In server/src/routes/scenarios.ts, line ~89:
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
// Change to any supported model:
// 'gemini-2.5-pro', 'gemini-2.0-flash', etc.
```

### If You Want to Add Your Own Baseline Data
Currently the scenario page sends hardcoded baseline values. To make this dynamic, update `ScenariosPage.tsx` to pull from `useDashboard()`:

```typescript
// In ScenariosPage.tsx handleSubmit():
const { summary, drivers } = useDashboard()

simulate({
  prompt: text,
  currentData: {
    gssi: summary.data?.currentGSSI ?? 72,
    regime: summary.data?.stressRegime?.toUpperCase() ?? 'ELEVATED',
    drivers: {
      energy: drivers.data?.find(d => d.id === 'energy')?.contribution ?? 35,
      // ... etc for each driver
    },
  },
})
```

---

## 5. Cisco AI Analyst (Backend)

**File:** `server/src/routes/chat.ts`

### Endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/chat/message` | Multi-turn analyst conversation |
| `POST` | `/api/chat/parse-portfolio` | PDF portfolio extraction (multimodal) |

### What To Change
**Nothing required for basic operation** — this is already fully functional with Gemini.

### Customization Options

1. **Change the AI persona:** Edit the `ANALYST_SYSTEM_PROMPT` constant at the top of `chat.ts`
2. **Add more data surfaces:** Expand the `buildDataContext()` function to inject additional data sections
3. **Change the model:** Update the `getGenerativeModel()` call
4. **Add persistent storage:** Replace `localStorage` caching in `ChatPage.tsx` with a database call

---

## 6. Environment Variables

**File:** `server/.env`

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
```

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | **Yes** | Google Gemini API key. Get one at [Google AI Studio](https://aistudio.google.com/apikey) |
| `PORT` | No | Server port (default: 3001) |

### To Add Your Own API Keys (for real data sources)

```env
# Example additions:
FRED_API_KEY=your_fred_key           # Federal Reserve Economic Data
ALPHA_VANTAGE_KEY=your_av_key        # Stock/commodity data
NEWS_API_KEY=your_news_key           # News aggregation
FREIGHTOS_API_KEY=your_freight_key   # Freight indices
```

---

## 7. Adding a Real API

### Step-by-Step

**Step 1:** Create a new route file in `server/src/routes/`:

```typescript
// server/src/routes/dashboard.ts
import { Router } from 'express'

const router = Router()

router.get('/summary', async (req, res) => {
  // Call your real data source here
  const data = await yourDataService.getSummary()
  res.json(data) // Must match OverviewSummary interface
})

router.get('/history', async (req, res) => {
  const data = await yourDataService.getHistory()
  res.json(data) // Must match TrendPoint[]
})

// ... repeat for drivers, forecast, implications, recommendations

export { router as dashboardRouter }
```

**Step 2:** Register the route in `server/src/index.ts`:

```typescript
import { dashboardRouter } from './routes/dashboard.js'
app.use('/api/dashboard', dashboardRouter)
```

**Step 3:** Update the frontend hook (`useDashboard.ts`):

```typescript
import { apiFetch } from '@/lib/api'

export function useDashboard() {
  const summaryQuery = useQuery({
    queryKey: ['summary'],
    queryFn: () => apiFetch<OverviewSummary>('/dashboard/summary'),
  })
  // ... repeat for each data surface
}
```

**Step 4:** Delete the mock imports (optional).

---

## 8. Type Reference

All TypeScript interfaces live in `client/src/types/`. Here is the complete reference:

### `types/domain.ts` — Dashboard types

```typescript
type StressRegime = 'low' | 'elevated' | 'high' | 'critical'

interface OverviewSummary {
  currentGSSI: number
  stressRegime: StressRegime
  forecast1Month: number
  forecast3Month: number
  forecast3MonthProbability: number
  trendDirection: 'up' | 'down' | 'flat'
}

interface TrendPoint {
  date: string
  value: number
}

interface ForecastPoint {
  date: string
  actual: number | null
  forecast: number | null
  probability?: number
}

interface DriverBucket {
  id: string
  name: string
  score: number
  contribution: number
  status: 'improving' | 'worsening' | 'stable'
}

interface MarketImplication {
  id: string
  theme: string
  impact: 'positive' | 'negative' | 'neutral'
  description: string
}

interface Recommendation {
  id: string
  action: string
  rationale: string
  confidence?: 'Low' | 'Medium' | 'High'
}
```

### `types/portfolio.ts` — Portfolio types

```typescript
interface RegimeContext {
  gssiValue: number
  regime: StressRegime
  trendDirection: 'up' | 'down' | 'flat'
  deltaPercent: number
  description: string
}

interface AllocationSignal {
  id: string
  sector: string
  tier: 'overweight' | 'neutral' | 'avoid'
  confidence: number
  rationale: string
}

interface SectorImpact {
  id: string
  sector: string
  sentiment: 'bullish' | 'neutral' | 'bearish'
  signal: 'positive' | 'neutral' | 'negative'
  volatility: 'low' | 'medium' | 'high' | 'extreme'
  exposure: number
}

interface EquityExposure {
  id: string
  ticker: string
  companyName: string
  exposureDelta: number
  gssiCorrelation: number
  sentiment: 'positive' | 'neutral' | 'negative' | 'high_conviction'
}

interface SystemicDriver {
  id: string
  name: string
  impactPercent: number
  description: string
}

interface IntelligenceItem {
  id: string
  timestamp: string
  source: string
  headline: string
  tag: string
}

interface ActionProtocol {
  id: string
  type: 'alpha' | 'defense' | 'hedge' | 'rebalance'
  confidence: number
  title: string
  description: string
  horizon: string
  actionLabel: string
}
```

### `types/scenario.ts` — Scenario types

```typescript
interface ScenarioInput {
  prompt: string
  currentData?: {
    gssi: number
    regime: string
    drivers?: {
      energy: number
      transport: number
      trade: number
      congestion: number
      inventory: number
    }
  }
}

interface ScenarioResult {
  scenarioTitle: string
  summary: string
  baseline: { gssi: number; regime: string }
  projected: { gssi: number; regime: string; confidence: number; timeHorizon: string }
  factorDeltas: FactorDelta[]
  sectorImpact: SectorImpact[]
  portfolioActions: PortfolioAction[]
  cascadeNarrative: string
}
```

---

## Checklist: Going From Mock → Production

- [ ] Build API endpoints matching the interfaces above
- [ ] Update `useDashboard.ts` — swap 6 `queryFn` from mock → API
- [ ] Update `usePortfolio.ts` — swap 7 `fetchXxx()` functions from mock → API
- [ ] Set `GEMINI_API_KEY` in `server/.env` (already done if scenarios/chat work)
- [ ] Add any additional API keys for external data sources
- [ ] Test each page to verify data renders correctly
- [ ] (Optional) Remove `client/src/data/` mock files
- [ ] (Optional) Add `staleTime` and `refetchInterval` to React Query for real-time updates
