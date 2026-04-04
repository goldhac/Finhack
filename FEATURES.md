# ChainPulse — Feature Documentation

> **ChainPulse** is a macro-financial intelligence platform that measures global supply chain stress, forecasts future risk, decomposes systemic drivers, and translates stress signals into actionable portfolio strategy — all in real time.

---

## Table of Contents

1. [Landing Page](#1-landing-page)
2. [GSSI Dashboard](#2-gssi-dashboard)
3. [Portfolio Strategy](#3-portfolio-strategy)
4. [Scenario Simulator](#4-scenario-simulator)
5. [Cisco AI Analyst](#5-cisco-ai-analyst)
6. [Architecture Overview](#6-architecture-overview)
7. [Navigation & Layout](#7-navigation--layout)

---

## 1. Landing Page

**Route:** `/`

The homepage is the public-facing entry point that explains the platform's value proposition.

### Features

| Feature | Description |
|---|---|
| **Animated Hero** | Full-screen hero with dynamic gradient backgrounds and typewriter-style text animations |
| **Terminal Preview** | A live-simulated terminal that scrolls through GSSI data output to demonstrate the product's data-driven DNA |
| **What We Built** | A concise breakdown explaining the GSSI (Global Supply Chain Stress Index) and ChainPulse's position in the market |
| **Core Capabilities Grid** | Four capability cards: Real-Time Stress Monitoring, Predictive Forecasting, Driver Decomposition, Portfolio Strategy |
| **Deep Capabilities** | Detailed feature walkthroughs with section-by-section explanations |
| **Navigation Links** | Direct routing to Dashboard, Portfolio, Simulator, Analyst, and Briefing from the hero section |
| **Footer** | Tech stack disclosure, privacy links, system status indicator |

---

## 2. GSSI Dashboard

**Route:** `/dashboard`

The core analytics hub showing the current state of global supply chain stress.

### Features

| Feature | Description |
|---|---|
| **GSSI Overview Panel** | Displays the current Global Supply Chain Stress Index score (0–100), current stress regime (`NOMINAL`, `ELEVATED`, `HIGH_ALERT`, `CRITICAL`), 1-month and 3-month forecasts, forecast probability, and trend direction |
| **Historical Trend Chart** | Recharts area chart showing GSSI values over time (monthly data points) with smooth gradient fills |
| **Forecast Chart** | Dual-line chart overlaying actual historical GSSI with forward-looking forecast projections, including probability bands |
| **Driver Decomposition** | Five stress factor buckets displayed as a ranked horizontal bar system: **Energy**, **Transport**, **Trade**, **Congestion**, **Inventory**. Each shows score (0–100), contribution percentage, and status (improving/worsening/stable) |
| **Market Implications** | Themed implication cards (Inflation, Commodities, Risk) with positive/negative/neutral impact indicators and plain-language descriptions |
| **Executive Recommendations** | Actionable directives with confidence levels (High/Medium/Low), rationale text, and priority ranking |
| **Data Integration** | All data flows through the `useDashboard()` hook using React Query, which currently resolves from mock data files but is structured for API swap |

### Data Flow
```
useDashboard() hook
  ├── summary.mock.ts     → OverviewSummary
  ├── history.mock.ts     → TrendPoint[]
  ├── forecast.mock.ts    → ForecastPoint[]
  ├── drivers.mock.ts     → DriverBucket[]
  ├── implications.mock.ts → MarketImplication[]
  └── recommendations.mock.ts → Recommendation[]
```

---

## 3. Portfolio Strategy

**Route:** `/portfolio`

Translates GSSI stress data into concrete portfolio allocation and equity-level recommendations.

### Features

| Feature | Description |
|---|---|
| **Regime Context Banner** | Shows current GSSI, regime, trend direction, delta percentage, and a narrative description of the macro environment |
| **Allocation Signals Grid** | 6 sector allocation cards: Energy, Industrials, Consumer, Healthcare, Tech, Logistics. Each has a tier (`OVERWEIGHT` / `NEUTRAL` / `AVOID`), confidence percentage, and rationale |
| **Sector Impact Matrix** | Tabular display of sector sentiment (bullish/neutral/bearish), signal direction, volatility level (low/medium/high/extreme), and portfolio exposure percentage |
| **Equity Exposure Terminal** | Individual equity cards for $UPS, $XOM, $NVDA, $MAERSK, $CAT, $INTC. Each shows exposure delta, GSSI correlation percentage, and sentiment classification |
| **Systemic Drivers** | The three primary macro-drivers behind current portfolio positioning: Transport Costs, Port Congestion, Energy Pricing — each with impact percentage and description |
| **Intelligence Feed** | Real-time news feed with source attribution (Reuters, Bloomberg, Signal_GPT, Fin_Times, ChainPulse), timestamps, headlines, and classification tags |
| **Action Protocols** | Executable trade recommendations: Alpha (increase), Defense (reduce), Hedge (derivatives), Rebalance. Each with confidence %, time horizon, description, and action button |

### Data Flow
```
usePortfolio() hook
  ├── regime.mock.ts       → RegimeContext
  ├── allocations.mock.ts  → AllocationSignal[]
  ├── sectors.mock.ts      → SectorImpact[]
  ├── equities.mock.ts     → EquityExposure[]
  ├── drivers.mock.ts      → SystemicDriver[]
  ├── intelligence.mock.ts → IntelligenceItem[]
  └── protocols.mock.ts    → ActionProtocol[]
```

---

## 4. Scenario Simulator

**Route:** `/scenarios`

AI-powered "what-if" stress testing that simulates the cascading effects of geopolitical and economic shocks.

### Features

| Feature | Description |
|---|---|
| **Free-Form Prompt Input** | Users type any natural language scenario description (e.g., "Suez Canal blocked for 2 weeks") |
| **Preset Scenarios** | Six pre-built scenarios ranked by community popularity: Suez Canal Blockage (#1, 12.8k runs), Oil Spike +40% (#2), China Port Shutdown (#3), Fed Rate Hike +75bp (#4), EU Energy Crisis (#5), Semiconductor Shortage (#6). The top scenario is highlighted with a gold trophy badge |
| **Current Baseline Display** | Shows pre-simulation GSSI (72), Regime (ELEVATED), Top Factor (Energy 35%), and Engine (CISCO v2) |
| **Terminal Loading Animation** | Animated loading state with sequential console-style messages showing the simulation pipeline |
| **Simulation Results** | Full structured output including: scenario title, executive summary, baseline vs projected GSSI comparison, regime transition, confidence score, time horizon |
| **Factor Decomposition Delta** | Side-by-side bar chart comparison of all 5 factor weights before/after the scenario, with delta values and rationale per factor |
| **Sector Impact Matrix** | Lists 4–6 affected sectors with POSITIVE/NEGATIVE/NEUTRAL impact and LOW/MEDIUM/HIGH magnitude |
| **Action Protocols** | 3–5 portfolio actions (OVERWEIGHT/UNDERWEIGHT/HEDGE/MONITOR/EXIT) with urgency level and confidence |
| **Cascade Narrative** | AI-generated 3–5 sentence explanation of the causal chain from event → supply chain → market impact |

### Backend
- **Endpoint:** `POST /api/scenarios/simulate`
- **Engine:** Google Gemini 2.5 Flash with structured JSON output
- **System Prompt:** Receives scenario + baseline data, returns structured `ScenarioResult` JSON
- **Retry Logic:** Up to 3 attempts with temperature fallback (0.7 → 0.3)

---

## 5. Cisco AI Analyst

**Route:** `/chat`

Conversational AI that unifies all data surfaces into a single natural language interface.

### Features

| Feature | Description |
|---|---|
| **Two-Panel Layout** | Left panel: Portfolio Intelligence Hub (PDF upload, broker connect, data feeds). Right panel: Conversational AI chat |
| **PDF Portfolio Upload** | Drag-and-drop or click-to-browse PDF upload. The AI extracts holdings, sectors, weights, and risk assessments via multimodal Gemini analysis. Results are cached in `localStorage` with 24-hour TTL |
| **Broker Connect Placeholders** | UI placeholders for Schwab, Fidelity, Interactive Brokers, and Robinhood — labeled "Coming Soon" with hover overlays |
| **Active Data Feeds** | Visual indicator showing all connected data surfaces: GSSI Index, Driver Decomposition, Forecast Engine, Portfolio Strategy, Intelligence Feed, User Portfolio |
| **Quick Prompts** | Six pre-built prompts: "Why is GSSI rising?", "Energy exposure analysis", "Portfolio risk breakdown", "What should I hedge?", "Cross-sector stress map", "Forecast vs. current" |
| **Multi-Turn Conversation** | Full conversation history maintained across messages. User messages and Cisco responses are displayed with timestamps |
| **Inline Citations** | AI responses include clickable citation chips in the format `[SOURCE → METRIC: VALUE]` that reference specific data points |
| **Terminal-Style Loading** | When processing, displays an animated terminal showing: "Querying data surfaces...", "GSSI_INDEX: loaded", "DRIVER_MATRIX: loaded", "INFERENCE_ACTIVE" with a progress bar |
| **Context Injection** | Every message includes the full dashboard data, portfolio strategy data, and user-uploaded portfolio as context for the AI |
| **Chat Management** | Clear chat button, message count display, portfolio status indicator |

### Backend
- **Chat Endpoint:** `POST /api/chat/message` — Multi-turn conversational AI with full data context injection
- **Portfolio Parsing:** `POST /api/chat/parse-portfolio` — Multimodal PDF extraction returning structured JSON holdings
- **Engine:** Google Gemini 2.5 Flash with system prompt enforcing citation format
- **Retry Logic:** Up to 3 attempts with temperature fallback

---

## 6. Architecture Overview

### Frontend Stack
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite** | Build tool and dev server |
| **TypeScript** | Type safety across all components |
| **TailwindCSS v4** | Utility-first styling with custom dark theme |
| **React Query (TanStack)** | Async state management for all data hooks |
| **React Router v7** | Client-side routing |
| **Recharts** | Charting library for GSSI trend and forecast visualizations |
| **Google Fonts** | Space Grotesk (headings) + Inter (body) |
| **Material Symbols** | Icon system (outlined variant) |

### Backend Stack
| Technology | Purpose |
|---|---|
| **Express 5** | HTTP server and API routing |
| **TypeScript + tsx** | Server-side TypeScript execution |
| **Google Generative AI SDK** | Gemini 2.5 Flash integration |
| **dotenv** | Environment variable management |
| **CORS** | Cross-origin request handling |

### Project Structure
```
Fin-hack/
├── client/                    # Frontend (Vite + React)
│   └── src/
│       ├── pages/             # 5 route pages
│       ├── hooks/             # 4 data hooks (useDashboard, usePortfolio, useScenario, useChat)
│       ├── data/              # Mock data layer (13 files)
│       ├── types/             # TypeScript interfaces (domain, portfolio, scenario, chat)
│       ├── components/        # Shared UI components (AppShell, AppHeader, Sidebar)
│       ├── lib/               # Utilities (api.ts fetch wrapper)
│       └── services/          # Service layer
├── server/                    # Backend (Express)
│   └── src/
│       ├── index.ts           # Server entrypoint
│       └── routes/
│           ├── chat.ts        # AI Analyst endpoints
│           └── scenarios.ts   # Scenario simulator endpoint
└── .env                       # API key configuration
```

---

## 7. Navigation & Layout

### App Shell
All authenticated pages share a common layout via `<AppShell>`:
- **Sidebar** (left): Icon-based vertical navigation with page labels
- **Header** (top): QUANTUM_LEDGER branding, version indicator, system status
- **Content Area**: Full-width scrollable main content

### Routes
| Path | Page | Nav Label |
|---|---|---|
| `/` | Landing/Home | HOME |
| `/dashboard` | GSSI Dashboard | DATA |
| `/portfolio` | Portfolio Strategy | ALPHA |
| `/scenarios` | Scenario Simulator | SIM |
| `/chat` | Cisco AI Analyst | CHAT |

### Responsive Design
- Desktop-first layout with sidebar navigation
- Grid-based card layouts that adapt to viewport width
- Charts and tables use flexible container queries
