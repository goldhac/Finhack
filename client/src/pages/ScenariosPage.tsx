import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useScenario } from '@/hooks/useScenario'
import type { ScenarioResult } from '@/types/scenario'

const PRESET_SCENARIOS = [
  { label: 'Suez Canal Blockage', prompt: 'Suez Canal blocked by grounded vessel for 2 weeks, halting 12% of global trade', runs: 12847, rank: 1 },
  { label: 'Oil Spike +40%', prompt: 'OPEC announces 4 million barrel/day production cut, crude oil prices surge 40% overnight', runs: 9213, rank: 2 },
  { label: 'China Port Shutdown', prompt: 'Major COVID outbreak forces shutdown of Shanghai and Shenzhen ports for 3 weeks', runs: 7891, rank: 3 },
  { label: 'Fed Rate Hike +75bp', prompt: 'Federal Reserve announces emergency 75 basis point rate hike citing persistent inflation', runs: 6405, rank: 4 },
  { label: 'EU Energy Crisis', prompt: 'Russia cuts all remaining natural gas supply to Europe during winter months', runs: 5120, rank: 5 },
  { label: 'Semiconductor Shortage', prompt: 'Major earthquake in Taiwan disrupts TSMC production for 6 weeks, impacting 60% of global chip supply', runs: 4783, rank: 6 },
]

function formatRuns(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

export function ScenariosPage() {
  const [prompt, setPrompt] = useState('')
  const { simulate, result, isLoading, error, reset } = useScenario()

  const handleSubmit = (scenarioPrompt?: string) => {
    const text = scenarioPrompt || prompt
    if (!text.trim()) return
    simulate({
      prompt: text,
      currentData: {
        gssi: 72,
        regime: 'ELEVATED',
        drivers: { energy: 35, transport: 20, trade: 18, congestion: 15, inventory: 12 },
      },
    })
  }

  const handleReset = () => {
    setPrompt('')
    reset()
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* ── Page Header ── */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-['Inter'] text-[10px] tracking-[0.3em] uppercase text-[#0F62FE]">
              AI_ENGINE / SCENARIO_SIMULATOR
            </span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-5xl font-black tracking-[-0.04em] text-white uppercase leading-[0.9]">
            What-If<br />
            <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.2)' }}>
              Stress Test
            </span>
          </h1>
          <p className="font-['Inter'] text-[#C6C6C6] text-sm mt-4 max-w-2xl leading-relaxed">
            Simulate geopolitical, economic, and supply chain shock scenarios. The AI engine maps cascading effects
            across your GSSI factors, sectors, and portfolio positioning in real time.
          </p>
        </div>

        {/* ── Prompt Input ── */}
        {!result && !isLoading && (
          <div className="space-y-6">
            <div className="border border-[#474747]/20 bg-[#1B1B1B] p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-[#0F62FE] text-lg">science</span>
                <span className="font-['Inter'] text-[10px] tracking-[0.2em] uppercase text-[#919191]">
                  SCENARIO_INPUT_TERMINAL
                </span>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder='Describe a scenario... e.g. "Oil prices surge 40% due to OPEC production cuts"'
                    className="w-full bg-[#131313] border border-[#474747]/30 text-white font-['Inter'] text-sm px-4 py-3 placeholder:text-[#474747] focus:outline-none focus:border-[#0F62FE]/50 transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[9px] text-[#474747]">
                    ENTER ↵
                  </span>
                </div>
                <button
                  onClick={() => handleSubmit()}
                  disabled={!prompt.trim()}
                  className="bg-[#0F62FE] text-white px-8 py-3 font-['Space_Grotesk'] text-xs font-bold uppercase tracking-widest hover:bg-[#0052dd] transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 duration-100"
                >
                  Simulate
                </button>
              </div>
            </div>

            {/* Preset Chips with Popularity Ranking */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-['Inter'] text-[10px] tracking-[0.2em] uppercase text-[#919191]">
                  PRESET_SCENARIOS
                </span>
                <span className="font-['Inter'] text-[9px] tracking-wider uppercase text-[#474747] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[10px]">trending_up</span>
                  Ranked by community usage
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_SCENARIOS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setPrompt(preset.prompt)
                      handleSubmit(preset.prompt)
                    }}
                    className={`relative border text-[#C6C6C6] px-4 py-2.5 font-['Inter'] text-xs hover:text-white hover:bg-[#1F1F1F] transition-all duration-150 active:scale-95 flex items-center gap-2 group ${
                      preset.rank === 1
                        ? 'border-[#FFD700]/30 bg-[#FFD700]/5 hover:border-[#FFD700]/60'
                        : 'border-[#474747]/30 bg-[#1B1B1B] hover:border-[#0F62FE]/50'
                    }`}
                  >
                    {preset.rank === 1 && (
                      <span className="material-symbols-outlined text-[#FFD700] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        trophy
                      </span>
                    )}
                    {preset.rank !== 1 && (
                      <span className="font-['Space_Grotesk'] text-[10px] font-bold text-[#474747] w-4 text-center group-hover:text-[#0F62FE] transition-colors">
                        {preset.rank}
                      </span>
                    )}
                    <span className="material-symbols-outlined text-[#0F62FE] text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>
                      bolt
                    </span>
                    <span>{preset.label}</span>
                    <span className="font-mono text-[9px] text-[#474747] ml-1 group-hover:text-[#919191] transition-colors flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[9px]">group</span>
                      {formatRuns(preset.runs)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Baseline Context */}
            <div className="border border-[#474747]/10 bg-[#1B1B1B]/50 p-6">
              <span className="font-['Inter'] text-[10px] tracking-[0.2em] uppercase text-[#919191] block mb-4">
                CURRENT_BASELINE
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <span className="font-['Inter'] text-[9px] tracking-wider uppercase text-[#474747] block mb-1">GSSI</span>
                  <span className="font-['Space_Grotesk'] text-3xl font-black text-white">72<span className="text-sm text-[#919191] font-normal">/100</span></span>
                </div>
                <div>
                  <span className="font-['Inter'] text-[9px] tracking-wider uppercase text-[#474747] block mb-1">Regime</span>
                  <span className="font-['Space_Grotesk'] text-lg font-bold text-[#FFB4AB] uppercase">ELEVATED</span>
                </div>
                <div>
                  <span className="font-['Inter'] text-[9px] tracking-wider uppercase text-[#474747] block mb-1">Top Factor</span>
                  <span className="font-['Space_Grotesk'] text-lg font-bold text-white">Energy <span className="text-[#0F62FE]">35%</span></span>
                </div>
                <div>
                  <span className="font-['Inter'] text-[9px] tracking-wider uppercase text-[#474747] block mb-1">Engine</span>
                  <span className="font-['Space_Grotesk'] text-lg font-bold text-[#0F62FE]">CISCO v2</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Loading State ── */}
        {isLoading && <LoadingTerminal prompt={prompt} />}

        {/* ── Error State ── */}
        {error && (
          <div className="border border-[#93000A]/30 bg-[#93000A]/10 p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-[#FFB4AB]">error</span>
              <span className="font-['Space_Grotesk'] text-sm font-bold text-[#FFB4AB] uppercase">Simulation Failed</span>
            </div>
            <p className="font-['Inter'] text-sm text-[#C6C6C6]">{error.message}</p>
            <button
              onClick={handleReset}
              className="mt-4 border border-[#474747]/30 text-white px-6 py-2 font-['Space_Grotesk'] text-xs font-bold uppercase tracking-widest hover:bg-[#1F1F1F] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── Results ── */}
        {result && !isLoading && <ResultsView result={result} onReset={handleReset} />}
      </div>
    </AppShell>
  )
}

// ═══════════════════════════════════════
// Loading Terminal Animation
// ═══════════════════════════════════════
function LoadingTerminal({ prompt }: { prompt: string }) {
  return (
    <div className="border border-[#0F62FE]/20 bg-[#0E0E0E] p-8 space-y-4 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 bg-[#0F62FE] animate-ping" />
        <span className="font-['Space_Grotesk'] text-sm font-bold text-[#0F62FE] uppercase tracking-widest">
          Simulating Scenario...
        </span>
      </div>
      <div className="space-y-2 font-mono text-xs text-[#919191]">
        <p>&gt; SCENARIO_INPUT: "{prompt.slice(0, 80)}..."</p>
        <p>&gt; LOADING_BASELINE_GSSI: 72/100</p>
        <p>&gt; MAPPING_FACTOR_WEIGHTS...</p>
        <p>&gt; RUNNING_CASCADE_ANALYSIS...</p>
        <p className="text-[#0F62FE]">&gt; CISCO_INFERENCE_ACTIVE</p>
        <p className="text-[#474747]">&gt; COMPUTING_SECTOR_IMPACT_MATRIX...</p>
        <p className="text-[#474747]">&gt; GENERATING_PORTFOLIO_ACTIONS...</p>
      </div>
      <div className="h-1 w-full bg-[#1F1F1F] mt-6 overflow-hidden">
        <div className="h-full bg-[#0F62FE] animate-[loading_2s_ease-in-out_infinite]" style={{ width: '60%' }} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// Results View
// ═══════════════════════════════════════
function ResultsView({ result, onReset }: { result: ScenarioResult; onReset: () => void }) {
  const gssiDelta = result.projected.gssi - result.baseline.gssi
  const isWorse = gssiDelta > 0

  const getRegimeColor = (regime: string) => {
    switch (regime.toUpperCase()) {
      case 'NOMINAL': return 'text-green-400'
      case 'ELEVATED': return 'text-[#FFB4AB]'
      case 'HIGH_ALERT': return 'text-red-400'
      case 'CRITICAL': return 'text-red-500'
      default: return 'text-[#C6C6C6]'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'POSITIVE': return 'bg-green-500/20 text-green-400'
      case 'NEGATIVE': return 'bg-[#93000A]/20 text-[#FFB4AB]'
      default: return 'bg-[#474747]/20 text-[#C6C6C6]'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'IMMEDIATE': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'SHORT_TERM': return 'bg-[#FFB4AB]/10 text-[#FFB4AB] border-[#FFB4AB]/20'
      default: return 'bg-[#474747]/20 text-[#C6C6C6] border-[#474747]/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Result Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="font-['Inter'] text-[10px] tracking-[0.3em] uppercase text-[#0F62FE] block mb-1">
            SIMULATION_COMPLETE
          </span>
          <h2 className="font-['Space_Grotesk'] text-3xl font-black tracking-tight text-white uppercase">
            {result.scenarioTitle}
          </h2>
        </div>
        <button
          onClick={onReset}
          className="border border-[#474747]/30 text-white px-6 py-2 font-['Space_Grotesk'] text-xs font-bold uppercase tracking-widest hover:bg-[#1F1F1F] transition-colors active:scale-95 duration-100"
        >
          New Scenario
        </button>
      </div>

      {/* Executive Summary */}
      <div className="border border-[#0F62FE]/20 bg-[#0F62FE]/5 p-6">
        <span className="font-['Inter'] text-[9px] tracking-[0.2em] uppercase text-[#0F62FE] block mb-2">EXECUTIVE_SUMMARY</span>
        <p className="font-['Inter'] text-[#C6C6C6] text-sm leading-relaxed">{result.summary}</p>
      </div>

      {/* Before / After Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px]">
        {/* Baseline */}
        <div className="border border-[#474747]/10 bg-[#1B1B1B] p-6">
          <span className="font-['Inter'] text-[9px] tracking-[0.2em] uppercase text-[#919191] block mb-3">BASELINE</span>
          <div className="font-['Space_Grotesk'] text-4xl font-black text-white tracking-tight">
            {result.baseline.gssi}<span className="text-sm text-[#919191] font-normal">/100</span>
          </div>
          <span className={`font-['Space_Grotesk'] text-sm font-bold uppercase mt-1 block ${getRegimeColor(result.baseline.regime)}`}>
            {result.baseline.regime}
          </span>
        </div>

        {/* Projected */}
        <div className={`border p-6 ${isWorse ? 'border-[#93000A]/30 bg-[#93000A]/5' : 'border-green-500/20 bg-green-500/5'}`}>
          <span className="font-['Inter'] text-[9px] tracking-[0.2em] uppercase text-[#919191] block mb-3">PROJECTED</span>
          <div className="font-['Space_Grotesk'] text-4xl font-black text-white tracking-tight">
            {result.projected.gssi}<span className="text-sm text-[#919191] font-normal">/100</span>
          </div>
          <span className={`font-['Space_Grotesk'] text-sm font-bold uppercase mt-1 block ${getRegimeColor(result.projected.regime)}`}>
            {result.projected.regime}
          </span>
        </div>

        {/* Delta */}
        <div className="border border-[#474747]/10 bg-[#1B1B1B] p-6">
          <span className="font-['Inter'] text-[9px] tracking-[0.2em] uppercase text-[#919191] block mb-3">DELTA</span>
          <div className={`font-['Space_Grotesk'] text-4xl font-black tracking-tight ${isWorse ? 'text-[#FFB4AB]' : 'text-green-400'}`}>
            {isWorse ? '+' : ''}{gssiDelta}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-['Inter'] text-[9px] tracking-wider uppercase text-[#919191]">
              Confidence: {(result.projected.confidence * 100).toFixed(0)}%
            </span>
            <span className="text-[#474747]">·</span>
            <span className="font-['Inter'] text-[9px] tracking-wider uppercase text-[#919191]">
              {result.projected.timeHorizon}
            </span>
          </div>
        </div>
      </div>

      {/* Factor Deltas */}
      <div className="border border-[#474747]/10 bg-[#1B1B1B] p-6">
        <span className="font-['Inter'] text-[10px] tracking-[0.2em] uppercase text-[#919191] block mb-4">FACTOR_DECOMPOSITION_DELTA</span>
        <div className="space-y-4">
          {result.factorDeltas.map((fd) => (
            <div key={fd.factor} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-2">
                <span className="font-['Space_Grotesk'] text-sm font-bold text-white uppercase">{fd.factor}</span>
              </div>
              <div className="col-span-1 text-right">
                <span className="font-mono text-xs text-[#919191]">{fd.baselineWeight}%</span>
              </div>
              <div className="col-span-4">
                <div className="relative h-2 bg-[#353535]">
                  <div className="absolute inset-y-0 left-0 bg-[#474747]" style={{ width: `${fd.baselineWeight}%` }} />
                  <div
                    className={`absolute inset-y-0 left-0 ${fd.delta > 0 ? 'bg-[#FFB4AB]' : 'bg-green-400'}`}
                    style={{ width: `${fd.projectedWeight}%` }}
                  />
                </div>
              </div>
              <div className="col-span-1 text-right">
                <span className="font-mono text-xs text-white">{fd.projectedWeight}%</span>
              </div>
              <div className="col-span-1 text-center">
                <span className={`font-['Space_Grotesk'] text-sm font-bold ${fd.delta > 0 ? 'text-[#FFB4AB]' : fd.delta < 0 ? 'text-green-400' : 'text-[#919191]'}`}>
                  {fd.delta > 0 ? '+' : ''}{fd.delta}
                </span>
              </div>
              <div className="col-span-3">
                <span className="font-['Inter'] text-[10px] text-[#919191] leading-tight block">{fd.rationale}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sector Impact + Portfolio Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1px]">
        {/* Sector Impact */}
        <div className="border border-[#474747]/10 bg-[#1B1B1B] p-6">
          <span className="font-['Inter'] text-[10px] tracking-[0.2em] uppercase text-[#919191] block mb-4">SECTOR_IMPACT_MATRIX</span>
          <div className="space-y-2">
            {result.sectorImpact.map((si) => (
              <div key={si.sector} className="flex items-center justify-between py-2 border-b border-[#474747]/10 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-[9px] px-2 py-0.5 uppercase ${getImpactColor(si.impact)}`}>
                    {si.impact}
                  </span>
                  <span className="font-['Space_Grotesk'] text-sm font-bold text-white uppercase">{si.sector}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[9px] text-[#919191] uppercase">{si.magnitude}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Actions */}
        <div className="border border-[#474747]/10 bg-[#1B1B1B] p-6">
          <span className="font-['Inter'] text-[10px] tracking-[0.2em] uppercase text-[#919191] block mb-4">ACTION_PROTOCOLS</span>
          <div className="space-y-3">
            {result.portfolioActions.map((pa, i) => (
              <div key={i} className="p-3 border border-[#474747]/10 bg-[#131313]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-[9px] px-2 py-0.5 uppercase border ${getUrgencyColor(pa.urgency)}`}>
                      {pa.urgency}
                    </span>
                    <span className="font-['Space_Grotesk'] text-sm font-bold text-white uppercase">
                      {pa.action}: {pa.asset}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-[#0F62FE]">
                    {(pa.confidence * 100).toFixed(0)}% CONF.
                  </span>
                </div>
                <p className="font-['Inter'] text-[10px] text-[#919191] leading-relaxed">{pa.rationale}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cascade Narrative */}
      <div className="border border-[#0F62FE]/10 bg-[#0F62FE]/5 p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="material-symbols-outlined text-[#0F62FE] text-lg">auto_awesome</span>
          <span className="font-['Inter'] text-[10px] tracking-[0.2em] uppercase text-[#0F62FE]">AI_CASCADE_ANALYSIS</span>
        </div>
        <p className="font-['Inter'] text-sm text-[#C6C6C6] leading-relaxed">{result.cascadeNarrative}</p>
      </div>
    </div>
  )
}
