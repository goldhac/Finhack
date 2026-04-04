import { Router } from 'express'
import fs from 'fs'
import path from 'path'

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Clamp a z-score in [-3,3] to a 0-100 display scale. */
function zTo100(z: number): number {
  return Math.round(((Math.min(Math.max(z, -3), 3) + 3) / 6) * 100)
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T
}

const E503 = { error: 'Pipeline output not available. Run data_refresh.py to generate data.' }

// ─── types (inline — mirrors Python output shape) ────────────────────────────

interface SummaryRaw {
  date: string
  GSSI_bucketed: number
  GSSI_equal: number
  GSSI_invvol: number
  regime: 'Normal' | 'Elevated' | 'Severe'
  percentile: number
  top_contributing_bucket: string
  bucket_contributions: Record<string, number>
}

interface HistoricalEntry {
  Date: string
  GSSI_Historical: number
  GSCPI_Norm: number
  CPIAUCSL_Norm: number
  regime: string
}

interface ForecastEntry {
  Date: string
  GSSI_Forecast: number
  lower_80: number
  upper_80: number
  lower_95: number
  upper_95: number
}

interface DashboardDataRaw {
  historical: HistoricalEntry[]
  forecast: ForecastEntry[]
  validation: Record<string, unknown>
  forecast_meta: Record<string, unknown>
}

// ─── factory ─────────────────────────────────────────────────────────────────

export function createGssiRouter(outputDir: string): Router {
  const router = Router()

  const p = (file: string) => path.join(outputDir, file)

  // ── GET /summary ────────────────────────────────────────────────────────────
  router.get('/summary', (_req, res) => {
    try {
      const raw = readJson<SummaryRaw>(p('gssi_summary.json'))
      const dash = readJson<DashboardDataRaw>(p('dashboard_data.json'))

      const regimeMap: Record<string, string> = {
        Normal:   'low',
        Elevated: 'elevated',
        Severe:   'critical',
      }

      // Trend direction from last 2 historical points
      const hist = dash.historical
      let direction: 'up' | 'down' | 'flat' = 'flat'
      if (hist.length >= 2) {
        const diff = hist[hist.length - 1].GSSI_Historical - hist[hist.length - 2].GSSI_Historical
        if (diff > 0.05) direction = 'up'
        else if (diff < -0.05) direction = 'down'
      }

      const forecast1m = dash.forecast[0]?.GSSI_Forecast ?? raw.GSSI_bucketed
      const forecast3m = dash.forecast[2]?.GSSI_Forecast ?? raw.GSSI_bucketed

      const probability =
        raw.regime === 'Elevated' || raw.regime === 'Severe' ? 0.65 : 0.35

      res.json({
        currentGSSI:               zTo100(raw.GSSI_bucketed),
        stressRegime:              regimeMap[raw.regime] ?? 'low',
        forecast1Month:            zTo100(forecast1m),
        forecast3Month:            zTo100(forecast3m),
        forecast3MonthProbability: probability,
        trendDirection:            direction,
      })
    } catch {
      res.status(503).json(E503)
    }
  })

  // ── GET /history ────────────────────────────────────────────────────────────
  router.get('/history', (_req, res) => {
    try {
      const dash = readJson<DashboardDataRaw>(p('dashboard_data.json'))
      const points = dash.historical
        .map(e => ({
          date:  e.Date.substring(0, 7),
          value: zTo100(e.GSSI_Historical),
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
      res.json(points)
    } catch {
      res.status(503).json(E503)
    }
  })

  // ── GET /forecast ───────────────────────────────────────────────────────────
  router.get('/forecast', (_req, res) => {
    try {
      const dash = readJson<DashboardDataRaw>(p('dashboard_data.json'))
      const hist = dash.historical
      const fcast = dash.forecast

      const result: Array<{
        date: string
        actual: number | null
        forecast: number | null
        lower_80?: number | null
        upper_80?: number | null
        lower_95?: number | null
        upper_95?: number | null
      }> = []

      // Last 3 historical as actual-only points
      const tail = hist.slice(-3)
      for (let i = 0; i < tail.length - 1; i++) {
        result.push({
          date:     tail[i].Date.substring(0, 7),
          actual:   zTo100(tail[i].GSSI_Historical),
          forecast: null,
        })
      }

      // Connection point: last historical has both actual and forecast
      const last = tail[tail.length - 1]
      const connectionVal = zTo100(last.GSSI_Historical)
      result.push({
        date:     last.Date.substring(0, 7),
        actual:   connectionVal,
        forecast: connectionVal,
      })

      // 6 forecast-only points with confidence bands
      for (const f of fcast) {
        result.push({
          date:     f.Date.substring(0, 7),
          actual:   null,
          forecast: zTo100(f.GSSI_Forecast),
          lower_80: zTo100(f.lower_80),
          upper_80: zTo100(f.upper_80),
          lower_95: zTo100(f.lower_95),
          upper_95: zTo100(f.upper_95),
        })
      }

      res.json(result)
    } catch {
      res.status(503).json(E503)
    }
  })

  // ── GET /drivers ────────────────────────────────────────────────────────────
  router.get('/drivers', (_req, res) => {
    try {
      const raw = readJson<SummaryRaw>(p('gssi_summary.json'))

      const bucketMap: Record<string, { id: string; name: string }> = {
        'Bucket A \u2013 Freight (BDI)':            { id: 'freight',    name: 'Freight (BDI)' },
        'Bucket B \u2013 Frictions (GSCPI)':        { id: 'frictions',  name: 'Frictions (GSCPI)' },
        'Bucket C \u2013 Energy/Costs (WTI + CPI)': { id: 'energy',     name: 'Energy / Costs' },
        'Bucket D \u2013 Production (INDPRO)':       { id: 'production', name: 'Production (INDPRO)' },
        'Market Stress Overlay (VIX)':               { id: 'vix',        name: 'Market Overlay (VIX)' },
      }

      const contribs = raw.bucket_contributions
      const totalAbs = Object.values(contribs).reduce((s, v) => s + Math.abs(v), 0) || 1

      const drivers = Object.entries(contribs).map(([key, val]) => {
        const meta = bucketMap[key] ?? { id: key.toLowerCase().replace(/\s+/g, '_'), name: key }
        return {
          id:           meta.id,
          name:         meta.name,
          score:        zTo100(val),
          contribution: Math.round((Math.abs(val) / totalAbs) * 1000) / 10,
          status:       val > 0.02 ? 'worsening' : val < -0.02 ? 'improving' : 'stable',
        }
      })

      drivers.sort((a, b) => b.contribution - a.contribution)
      res.json(drivers)
    } catch {
      res.status(503).json(E503)
    }
  })

  // ── GET /implications ───────────────────────────────────────────────────────
  router.get('/implications', (_req, res) => {
    try {
      const raw = readJson<SummaryRaw>(p('gssi_summary.json'))
      const c = raw.bucket_contributions
      const energyVal = c['Bucket C \u2013 Energy/Costs (WTI + CPI)'] ?? 0
      const vixVal    = c['Market Stress Overlay (VIX)'] ?? 0

      const isStressed = raw.regime === 'Severe' || raw.regime === 'Elevated'

      res.json([
        {
          id:          'impl-1',
          theme:       'Inflation',
          impact:      isStressed ? 'negative' : 'neutral',
          description: `Supply chain stress is ${raw.regime.toLowerCase()} (GSSI ${raw.GSSI_bucketed.toFixed(3)}, ${raw.percentile.toFixed(0)}th percentile). ` +
                       `Top driver is ${raw.top_contributing_bucket}. ` +
                       (isStressed
                         ? 'Elevated stress increases cost-push inflation pass-through risk across intermediate goods.'
                         : 'Current conditions suggest contained inflationary pressure from supply-side constraints.'),
        },
        {
          id:          'impl-2',
          theme:       'Commodities',
          impact:      energyVal > 0 ? 'negative' : 'neutral',
          description: `Energy/Costs bucket contribution is ${energyVal >= 0 ? '+' : ''}${energyVal.toFixed(4)} z-units. ` +
                       (energyVal > 0
                         ? 'Positive energy/cost pressure is feeding through to intermediate material prices.'
                         : 'Energy and input cost pressures are currently subdued, providing commodity pricing relief.'),
        },
        {
          id:          'impl-3',
          theme:       'Volatility / Risk',
          impact:      vixVal > 0.05 ? 'negative' : 'neutral',
          description: `Market stress overlay (VIX) contribution is ${vixVal >= 0 ? '+' : ''}${vixVal.toFixed(4)} z-units. ` +
                       (vixVal > 0.05
                         ? 'Elevated market volatility is amplifying supply chain uncertainty.'
                         : 'Market volatility overlay is neutral, partially offsetting other stress drivers.'),
        },
      ])
    } catch {
      res.status(503).json(E503)
    }
  })

  // ── GET /recommendations ────────────────────────────────────────────────────
  router.get('/recommendations', (_req, res) => {
    try {
      const raw = readJson<SummaryRaw>(p('gssi_summary.json'))
      const { regime, percentile, GSSI_bucketed, top_contributing_bucket } = raw
      const gssiDisp = zTo100(GSSI_bucketed)

      // Rule 1 — regime-based
      let rec1action: string, rec1conf: 'High' | 'Medium' | 'Low'
      if (regime === 'Severe') {
        rec1action = 'Reduce Supply Chain Exposure'; rec1conf = 'High'
      } else if (regime === 'Elevated') {
        rec1action = 'Hedge Logistics & Energy Costs'; rec1conf = 'High'
      } else {
        rec1action = 'Monitor Leading Indicators'; rec1conf = 'Low'
      }

      // Rule 2 — top bucket
      let rec2action: string, rec2conf: 'High' | 'Medium' | 'Low'
      if (top_contributing_bucket.includes('Freight')) {
        rec2action = 'Diversify Shipping Routes'; rec2conf = 'Medium'
      } else if (top_contributing_bucket.includes('Frictions')) {
        rec2action = 'Build Safety Stock Buffers'; rec2conf = 'Medium'
      } else if (top_contributing_bucket.includes('Energy')) {
        rec2action = 'Hedge Energy Input Costs'; rec2conf = 'High'
      } else if (top_contributing_bucket.includes('Production')) {
        rec2action = 'Audit Supplier Concentration Risk'; rec2conf = 'Medium'
      } else {
        rec2action = 'Review Volatility Exposure'; rec2conf = 'Medium'
      }

      // Rule 3 — percentile
      let rec3action: string, rec3conf: 'High' | 'Medium' | 'Low'
      if (percentile > 75) {
        rec3action = 'Stress Test Portfolio Scenarios'; rec3conf = 'High'
      } else if (percentile > 50) {
        rec3action = 'Increase Cash Buffer Allocation'; rec3conf = 'Medium'
      } else {
        rec3action = 'Maintain Current Positioning'; rec3conf = 'Low'
      }

      res.json([
        {
          id:         'rec-1',
          action:     rec1action,
          rationale:  `GSSI is ${gssiDisp}/100 (${regime} regime, ${percentile.toFixed(0)}th percentile). ${
            regime === 'Severe'   ? 'Systemic stress warrants immediate exposure reduction.' :
            regime === 'Elevated' ? 'Elevated stress signals rising logistics and energy cost risk.' :
                                    'Conditions are stable; maintain watchful positioning.'
          }`,
          confidence: rec1conf,
        },
        {
          id:         'rec-2',
          action:     rec2action,
          rationale:  `Top contributing bucket: ${top_contributing_bucket}. GSSI at ${gssiDisp}/100 with ${percentile.toFixed(0)}th percentile ranking against historical readings.`,
          confidence: rec2conf,
        },
        {
          id:         'rec-3',
          action:     rec3action,
          rationale:  `Historical percentile: ${percentile.toFixed(1)}th. ${
            percentile > 75 ? 'This is a historically elevated reading — scenario stress testing is warranted.' :
            percentile > 50 ? 'Above-median reading suggests building defensive buffers.' :
                              'Below-median stress level supports maintaining current portfolio positioning.'
          }`,
          confidence: rec3conf,
        },
      ])
    } catch {
      res.status(503).json(E503)
    }
  })

  // ── GET /validation ─────────────────────────────────────────────────────────
  router.get('/validation', (_req, res) => {
    try {
      const dash = readJson<DashboardDataRaw>(p('dashboard_data.json'))
      res.json({ validation: dash.validation, forecast_meta: dash.forecast_meta })
    } catch {
      res.status(503).json(E503)
    }
  })

  // ── GET /refresh-status ─────────────────────────────────────────────────────
  router.get('/refresh-status', (_req, res) => {
    try {
      const data = readJson<Record<string, unknown>>(p('last_refresh.json'))
      res.json(data)
    } catch {
      // Always 200 — file may not exist yet
      res.json({ timestamp_utc: null, pipeline_exit_code: null, message: 'No refresh has been run yet.' })
    }
  })

  return router
}
