# ChainPulse: Global Supply Chain Stress Index (GSSI) Platform
## System Architecture & Analytical Capability Report

**Date:** April 4, 2026  
**System Version:** Build V.2.0.48-STABLE  
**Classification:** Internal System Report

---

## 1. Executive Summary

ChainPulse is a production-grade macro-financial analytics platform engineered to measure, forecast, and act upon global supply chain stress. Diverging from traditional lagging indicators, ChainPulse operates a causal, real-time pipeline that synthesizes fragmented macroeconomic signals into a singular, actionable metric: the **Global Supply Chain Stress Index (GSSI)**.

This report details the platform's exact technical grounding, explaining the mathematical construction of the GSSI within the data pipeline, the API and integration layers, and the high-performance user interfaces spanning portfolio strategy, AI-led scenario simulation, and the unified conversational environment led by the "CISCO" AI Analyst. 

---

## 2. Core Methodology: The Data Pipeline

The backbone of ChainPulse is an offline-capable Python data processing pipeline (`gssi_pipeline.py`) structured to eliminate look-ahead bias and guarantee institutional rigor.

### 2.1 Signal Capture & Ingestion
The system acquires and aligns six independent, monthly, macro-indicators:
- **BDI (Baltic Dry Index):** Measures maritime transport and freight stress.
- **GSCPI (Global Supply Chain Pressure Index via NY Fed):** Tracks baseline logistics frictions.
- **WTI (West Texas Intermediate Crude):** Evaluates energy cost pressures.
- **CPI (Consumer Price Index - CPIAUCSL):** Assesses downstream inflationary feedback.
- **INDPRO (Industrial Production Index):** Measures production capacity and output constraints.
- **VIX (Volatility Index):** Provides a global market uncertainty overlay.

### 2.2 Strict Causal Normalization
Raw data undergoes targeted mathematical transformations designed to capture the *velocity* of stress prior to normalization. BDI and INDPRO rely on Month-over-Month (MoM) percentage changes, CPI uses Year-over-Year (YoY) rates, and WTI leverages a rolling 3-month variance limit, filtering out episodic noise. 

Crucially, the pipeline applies an **expanding-window z-score normalization** (with a minimum 24-month warmup and a cap of ±3 standard deviations). At any point $t$, the z-score relies only on data from $[0 ... t-1]$, ensuring *zero look-ahead bias* necessary for backtesting integrity.

### 2.3 The GSSI Composite
Normalized factors are combined into a base GSSI score using a defensive **bucketed equal-weight scheme**:
- **Bucket A (Freight - BDI):** 25.0%
- **Bucket B (Frictions - GSCPI):** 25.0%
- **Bucket C (Energy/Costs - WTI + CPI):** 25.0% (12.5% each)
- **Bucket D (Production - INDPRO):** 12.5%
- **Market Overlay (VIX):** 12.5%

This generates a final GSSI metric mapped from standard deviations onto an intuitive `[0, 100]` spectrum, actively classified into regimes: `Nominal`, `Elevated`, or `Severe`.

### 2.4 ML Forward Forecasting
The pipeline performs a walk-forward holdout validation evaluating both Holt-Winters Exponential Smoothing and **recursive XGBoost models** over historical horizons. The preferred predictive model (dynamically selected based on MAE) generates a structural 6-month forecast complete with 80% and 95% confidence intervals, subject to long-horizon mean reversion to maintain statistical stability.

---

## 3. Platform Architecture & Data Flow

The platform relies on a decoupled, three-tier architecture ensuring maximum resilience and clear separation of concerns.

### 3.1 Backend & Middleware (Node.js & Express 5)
An Express 5 server (`server/src/index.ts`) interfaces securely with both the generated analytical files and the Gemini infrastructure. 
- **API Controllers:** Routes inside `routes/gssi.ts` serve the processed datasets (Overview, History, Forecasts, Drivers, Implications) to the frontend.
- **AI Inference:** Real-time AI endpoints handle logic for both the Scenario Simulator (`routes/scenarios.ts`) and the conversational Analyst (`routes/chat.ts`).

### 3.2 Frontend Ecosystem (React 18 & Vite)
The UI comprises a high-fidelity dashboard built upon React 18, managed by Vite, styled via TailwindCSS, and integrated with dynamic API tracking managed via TanStack Query hooks (e.g., `useDashboard`, `useScenario`). 

The interface employs a premium typography hierarchy prioritizing **Space Grotesk** and **Inter** fonts over a dark-mode palette characterized by high-contrast neon accents, rendering data immediately legible for executive viewing.

---

## 4. Product Modules & Capabilities

### 4.1 Dashboard Analytics Hub (`/dashboard`)
Serves as the executive command center. Features include:
- **Baseline Monitors:** Current GSSI standing, probability constraints, and multi-month trajectory indicators.
- **Forward & Historical Tracking:** Implemented via responsive Recharts components, charting actual vs. probabilistic trajectories.
- **Driver Decomposition:** Granular view of individual bucket performance, identifying whether Energy, Freight, or Frictions are driving current market stress levels.

### 4.2 Portfolio Strategy Protocol (`/portfolio`)
Operationalizes GSSI metrics directly into portfolio impact matrices across core sectors:
- **Sector Impact Array:** Categorizes sector signals (Bullish/Bearish) and dynamic equity exposure tracking (e.g., `$XOM`, `$NVDA`, `$UPS`).
- **Action Protocols:** System-issued programmatic alerts denoting institutional responses—ranging from `ALPHA_CALL` to `DEFENSE_CALL` or `REBALANCE`.

### 4.3 AI Scenario Simulator (`/scenarios`)
A first-in-class generative "what-if" framework querying the **Google Gemini 2.5 Flash** model. 
- Analyzes custom macroeconomic inputs or community-ranked presets (e.g., *Top Ranked: Suez Canal Blockage*).
- Simulates cascading shocks by intersecting user hypotheticals with current GSSI baseline states, adjusting driver weights automatically, mapping secondary shockwaves, and computing immediate portfolio defense actions.

### 4.4 CISCO: Conversational AI Analyst (`/chat`)
A comprehensive generative workspace featuring CISCO, the ChainPulse platform's agentic analyst. 
- Retains robust, multi-turn conversational history injected with live dashboard states for extreme context awareness.
- **PDF Extraction Module:** Ability to natively parse user-uploaded PDFs detailing portfolio holdings directly into tokenized context. 
- Delivers heavily formatted responses complete with actionable citations correlating market claims to internal pipeline data dimensions (`[SOURCE → METRIC]`).

---

## 5. Security & Deployment Posture
- **API Guarding:** External credentials (such as Google’s Gemini API Key) are rigorously maintained exclusively within localized `.env` variables and untracked by the version control system. 
- **Modular Data Sources:** As defined within the comprehensive `DATA_INTEGRATION.md`, the architecture maintains complete UI decoupling, functioning atop mocked JSON outputs natively swappable against live REST endpoints supporting OAuth implementations (e.g., Plaid, Interactive Brokers APIs) as scaling progresses.

---

## Concluding Assessment
The ChainPulse architecture has successfully evolved from a conceptual MVP into a highly stable, AI-augmented, financial-grade monitoring station. Through its adherence to causal mathematics, highly stylized and performant user interface, and intelligent programmatic analytics modules, ChainPulse definitively mitigates the gap between macro-level disruptions and targeted financial allocation strategies.
