# ChainPulse — Dashboard Structure Specification

## 1. Layout Strategy

ChainPulse is a **single-page balanced dashboard** — not a stacked report, not a multi-tab app.

Sections are arranged in a grid-friendly row structure where related panels sit side by side. The design prioritizes:

- **Quick readability** — the most critical signal (GSSI score + regime) is visible immediately on load
- **Strong demo value** — charts and cards are visually prominent without requiring interaction
- **Clean implementation** — consistent use of reusable components, predictable spacing, no layout surprises

---

## 2. Page Rows

```
┌─────────────────────────────────────────────────────┐
│  Row 1: Overview Cards (4 cards)                    │
├─────────────────────────────────────────────────────┤
│  Row 2: GSSI Historical Trend                       │
├─────────────────────────────────────────────────────┤
│  Row 3: Forecast Visualization                      │
├──────────────────────────┬──────────────────────────┤
│  Row 4: Drivers          │  Row 5: Market Impl.    │
├─────────────────────────────────────────────────────┤
│  Row 6: Recommendations                             │
└─────────────────────────────────────────────────────┘
```

| Row | Section | Layout |
|-----|---------|--------|
| 1 | Overview cards | 4-column card strip |
| 2 | GSSI Historical Trend | Full-width chart |
| 3 | Forecast Visualization | Full-width chart |
| 4 + 5 | Drivers + Market Implications | 2-column split (50/50) |
| 6 | Recommendations | Full-width card list |

---

## 3. Section Specifications

### Row 1 — Overview Cards

Four metric cards displayed horizontally.

| Card | Primary Content | Secondary Content |
|------|-----------------|-------------------|
| Current GSSI | Composite score (0–100) | Stress label (Low / Moderate / High) |
| Stress Regime | Regime badge | Normal / Elevated / Severe |
| 1-Month Forecast | Predicted GSSI value | Directional indicator (↑ / ↓) |
| 3-Month Forecast | Predicted GSSI value | "65% probability of elevated stress" *(subtext — not a separate card)* |

> ⚠️ The elevated-stress probability is **subtext within the 3-Month Forecast card**. It is not a standalone card or panel.

---

### Row 2 — GSSI Historical Trend

- Full-width line chart of GSSI from 2010 to present
- X-axis: time (monthly)
- Y-axis: GSSI score
- Optional: annotated markers for major events (COVID, energy shocks)
- Tooltip: exact GSSI value on hover

---

### Row 3 — Forecast Visualization

- Full-width line chart combining:
  - Historical GSSI (solid line)
  - Forecasted GSSI path — 1-month and 3-month horizon (dashed line)
- Confidence band shading around the forecast
- Clear visual boundary between historical and forecast regions
- Summary stat above or below: probability of elevated stress over the forecast horizon

---

### Row 4 — Driver Decomposition (left, 50%)

The UI should emphasize **contribution magnitude** and **dominant driver identification**, not static weights.

**Buckets:**

| Bucket | Role |
|--------|------|
| Transport | Freight and logistics stress |
| Congestion | Port and transit bottlenecks |
| Energy | Energy cost pressure |
| Trade | Trade flow disruption |
| Inventory | Inventory imbalance signal |

All buckets are equally weighted (25% each). Weight is **not the primary insight** — do not over-emphasize it in the UI.

**UI elements:**
- Bar chart (recommended) or ranked list (fallback) showing per-bucket contribution to current GSSI
- Dominant driver callout — text label of the highest-contributing bucket
- Normalized bucket scores listed beneath the chart

> **Key principle:** The chart and UI should communicate relative contribution magnitude, not static weights.

---

### Row 5 — Market Implications (right, 50%)

Displays the relationship between the current GSSI and macro-financial conditions.

**Themes:**

| Theme | Content |
|-------|---------|
| Inflation | Implication of current stress for input costs and CPI trajectory |
| Commodities | Energy and freight stress signal for commodity markets |
| Sector / Risk | Broader risk signal from market volatility and trade disruption |

**Suggested format:**
- Heatmap or structured table
- Directional indicators per theme (↑ / ↓ / → neutral)

Content is rule-based, keyed to the current GSSI regime. Not AI-generated.

---

### Row 6 — Recommendations

- 3–5 rule-based recommendation cards in a horizontal or wrapping grid
- Each card contains:
  - **Action** — what to do (e.g., "Avoid logistics-sensitive sectors")
  - **Rationale** — grounded in a specific driver or regime
  - **Confidence** — optional tag (Low / Medium / High)
- Cards are selected from a rule-based lookup against the current stress regime and dominant driver

---

## 4. Reusable Components

| Component | Purpose |
|-----------|---------| 
| `AppShell` | Page wrapper — sets max-width, padding, background, header |
| `SectionCard` | Bordered card container used by every section panel |
| `MetricCard` | Single-stat display card used in Row 1 |
| `StatusBadge` | Colored pill for stress regime labels and severity tags |
| `LoadingState` | Skeleton placeholder rendered while data resolves |
| `ErrorState` | Error message + retry affordance rendered on fetch failure |
| `ChartContainer` | Wrapper providing consistent height, padding, and Recharts sizing |
| `RecommendationCard` | Card layout for action + rationale + confidence tag |

---

## 5. Layout Constraints

The following are explicitly excluded from the MVP layout:

- **No sidebar** — full-width content area only
- **No multi-page routing** — everything renders on a single route
- **No advanced filters** — no date pickers, indicator toggles, or search
- **No settings panel** — no user preferences, no methodology editor
- **No dark mode** — single appearance, light or neutral theme only
- **No unnecessary animations** — no page transitions, no animated counters; chart render animations are acceptable if default

---

## 6. Future Enhancements (not for MVP)

- **Indicator drilldowns** — click into a bucket to see its underlying indicator history
- **Forecasted indicators** — per-indicator forward projections alongside the composite forecast
- **Filters** — date range selector, bucket/indicator toggle, regime filter
- **Mobile optimization** — responsive stacking of chart rows
- **Export tools** — download GSSI data as CSV or snapshot as PDF
- **Dynamic weighting** — user-adjustable bucket weights with live score recalculation
- **Methodology editor** — configure indicators, normalization windows, and weights in-app
