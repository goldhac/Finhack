# ChainPulse — MVP Scope

## 1. Product Goal

A single-page dashboard that computes and displays a **Global Supply Chain Stress Index (GSSI)** from a fixed set of macroeconomic indicators, providing analysts with an at-a-glance early-warning signal, driver breakdown, and actionable market implications.

---

## 2. In Scope

### Dashboard Panels
- **Current GSSI** — Composite score (0–100) with a stress label (Low / Elevated / High / Critical)
- **Forecasted GSSI** — Short-horizon directional forecast derived from mock projection data
- **GSSI Historical Trend** — Time-series line chart of the index over the available data range
- **Driver Decomposition** — Per-bucket contribution breakdown displayed as a bar or radar chart
- **Market Implications** — Templated text block interpreting the current GSSI level
- **Recommendations** — Suggested actions derived from the stress level and dominant drivers

### Technical
- Mock data layer wired to all panels (no live API calls in v1)
- Loading states for all async data fetches
- Error boundary / error states for failed data resolution
- Vite + React + TypeScript scaffold
- Tailwind CSS + shadcn/ui component library
- React Query for data fetching and cache management
- Recharts for all data visualizations

### Index Construction (fixed for MVP)
- **4 buckets:** Transportation & Freight, Inflation Pressure, Market Volatility, Energy Costs — a simplified proxy of supply chain stress chosen for MVP speed; each bucket approximates a broader supply chain dynamic rather than exhaustively modeling it
- **1 indicator per bucket** (Baltic Dry Index, CPI, VIX, WTI Crude)
- **Equal weights** (25% per bucket, no dynamic adjustment)

---

## 3. Out of Scope

- Per-indicator forecasting (only composite GSSI is forecasted)
- Authentication and user accounts
- Export features (PDF, CSV, image)
- Dynamic weighting controls or methodology editor
- Advanced filters (date range picker, indicator toggles)
- Real-time or streaming data
- Dark mode
- Mobile-specific layout optimization
- Multi-scenario or what-if analysis

---

## 4. Core Assumptions

- All data is served from a static mock module — no backend is required for v1
- The GSSI formula is fixed: normalized score per indicator → averaged per bucket → equal-weight average of buckets
- Indicators are normalized to comparable stress scores using a fixed historical reference window
- Forecasted GSSI is a precomputed mock forecast representing model output for MVP purposes
- Market implications and recommendations are rule-based strings keyed to stress level
- Equal weighting is used to prioritize transparency and interpretability over model complexity
- The app runs in a single browser tab with no routing required

---

## 5. Success Criteria

| Criteria | Definition of Done |
|---|---|
| GSSI renders correctly | Composite score displays with correct label for mock data |
| All panels visible | Trend, decomposition, implications, and recommendations all render without errors |
| Forecast visible | A forecasted GSSI value or short series is shown alongside current |
| Loading states work | Panels show skeleton/spinner while data resolves |
| Error states work | Panels degrade gracefully when mock fetch is rejected |
| No console errors | Clean browser console on initial load |
| Build passes | `vite build` exits with no errors |
| Interpretability | A user can understand what is driving stress within 5 seconds |

---

## 6. Risks if Scope Expands

| Expansion | Risk |
|---|---|
| Adding real API integration mid-sprint | Unblocks backend dependency, breaks mock contracts, delays UI polish |
| Adding per-indicator forecasting | Requires separate model or proxy — doubles data complexity |
| Dynamic weighting controls | Forces re-architecture of the scoring pipeline |
| Auth layer | Adds routing, session management, and protected routes — scope explosion |
| Real-time streaming | WebSocket or SSE setup, state management overhead, testing burden |
| Multi-indicator per bucket | Requires aggregation logic changes and broader normalization review |
| Mobile layout | Recharts responsive tuning is non-trivial; double the CSS work |
