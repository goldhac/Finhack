import { Link } from 'react-router-dom'
import terminalPreview from '@/assets/terminal-preview.png'

export function HomePage() {
  return (
    <div className="min-h-screen bg-[#131313] text-[#E2E2E2] font-sans selection:bg-[#0F62FE]/30 selection:text-white overflow-x-hidden">
      {/* ═══ Grain Overlay ═══ */}
      <div className="fixed inset-0 z-10 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
      }} />

      {/* ═══ Navigation ═══ */}
      <nav className="fixed top-0 w-full z-50 bg-neutral-950/60 backdrop-blur-3xl bg-gradient-to-b from-neutral-800/10 to-transparent">
        <div className="flex justify-between items-center w-full px-8 py-4">
          <div className="flex items-center gap-12">
            <Link to="/" className="font-['Space_Grotesk'] text-2xl font-black tracking-tighter text-white uppercase">
              ChainPulse
            </Link>
            <div className="hidden md:flex gap-8 items-center">
              <Link className="font-['Space_Grotesk'] tracking-tighter uppercase text-xs text-neutral-500 hover:text-neutral-200 transition-colors duration-150" to="/dashboard">ANALYTICS</Link>
              <Link className="font-['Space_Grotesk'] tracking-tighter uppercase text-xs text-neutral-500 hover:text-neutral-200 transition-colors duration-150" to="/portfolio">STRATEGY</Link>
              <Link className="font-['Space_Grotesk'] tracking-tighter uppercase text-xs text-neutral-500 hover:text-neutral-200 transition-colors duration-150" to="/scenarios">SCENARIOS</Link>
              <Link className="font-['Space_Grotesk'] tracking-tighter uppercase text-xs text-neutral-500 hover:text-neutral-200 transition-colors duration-150" to="/chat">ANALYST</Link>
              <a className="font-['Space_Grotesk'] tracking-tighter uppercase text-xs text-neutral-500 hover:text-neutral-200 transition-colors duration-150" href="#features">FEATURES</a>
              <a className="font-['Space_Grotesk'] tracking-tighter uppercase text-xs text-neutral-500 hover:text-neutral-200 transition-colors duration-150" href="#how-it-works">HOW IT WORKS</a>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="bg-[#0052dd] text-white px-6 py-2 font-['Space_Grotesk'] text-xs font-bold uppercase tracking-widest active:scale-95 duration-100 ease-linear hover:bg-[#0F62FE] inline-block"
            >
              Open Terminal
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative">
        {/* ═══ HERO SECTION ═══ */}
        <section className="relative min-h-screen flex flex-col justify-center px-8 pt-24 overflow-hidden">
          {/* Background radial + grid */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(15,98,254,0.08)_0%,transparent_60%)]" />
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }} />
          </div>

          <div className="relative z-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center gap-4">
                <span className="h-[1px] w-12 bg-[#0F62FE]" />
                <span className="font-['Inter'] text-[10px] tracking-[0.4em] uppercase text-[#C6C6C6]">
                  System Status: Nominal
                </span>
              </div>
              <h1 className="font-['Space_Grotesk'] text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] text-white uppercase">
                The Global <br />
                <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>
                  Ledger of
                </span>
                <br />
                <span className="bg-gradient-to-r from-[#0F62FE] to-blue-800 bg-clip-text text-transparent">
                  Stress.
                </span>
              </h1>
            </div>
            <div className="lg:col-span-4 pb-4">
              <p className="font-['Inter'] text-[#C6C6C6] text-lg leading-relaxed max-w-sm border-l border-[#474747]/30 pl-6">
                Real-time synthesis of cross-asset volatility and liquidity fragmentation across 42 institutional gateways.
              </p>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce">
            <span className="font-['Inter'] text-[9px] tracking-[0.3em] uppercase text-[#919191]">Scroll</span>
            <span className="material-symbols-outlined text-[#919191] text-sm">keyboard_arrow_down</span>
          </div>
        </section>

        {/* ═══ TERMINAL PREVIEW SECTION ═══ */}
        <section className="relative px-8 py-24">
          <div className="max-w-7xl mx-auto">
            <div className="glass-panel border border-[#474747]/10 p-4 relative group"
              style={{ boxShadow: '0 0 40px -10px rgba(15, 98, 254, 0.3)' }}
            >
              {/* Window chrome */}
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-[#FFB4AB]" />
                  <div className="w-2 h-2 bg-[#C6C6C6]/30" />
                  <div className="w-2 h-2 bg-[#C6C6C6]/30" />
                </div>
                <span className="font-['Inter'] text-[10px] text-[#C6C6C6] uppercase tracking-widest">
                  CP_TERMINAL_V2.0_INTERFACE
                </span>
              </div>

              <div className="aspect-video relative overflow-hidden bg-[#0E0E0E]">
                <img
                  src={terminalPreview}
                  alt="ChainPulse terminal interface with financial data visualizations"
                  className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E] via-transparent to-transparent" />

                {/* Floating data overlays */}
                <div className="absolute top-12 left-12 glass-panel p-4 border border-[#0F62FE]/20">
                  <span className="block font-['Inter'] text-[9px] text-[#0F62FE] uppercase mb-2">
                    Liquidity Delta
                  </span>
                  <div className="text-2xl font-['Space_Grotesk'] font-bold text-white tracking-tighter">
                    0.8422 <span className="text-xs text-[#FFB4AB]">▼ 0.04%</span>
                  </div>
                </div>

                <div className="absolute bottom-12 right-12 glass-panel p-4 border border-[#0F62FE]/20 text-right">
                  <span className="block font-['Inter'] text-[9px] text-[#0F62FE] uppercase mb-2">
                    Volatility Index
                  </span>
                  <div className="text-2xl font-['Space_Grotesk'] font-bold text-white tracking-tighter">
                    24.88 <span className="text-xs text-green-500">▲ 1.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ WHAT WE BUILT — Explainer Section ═══ */}
        <section id="how-it-works" className="relative px-8 py-32">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-5 space-y-8">
                <div className="flex items-center gap-4">
                  <span className="h-[1px] w-12 bg-[#0F62FE]" />
                  <span className="font-['Inter'] text-[10px] tracking-[0.4em] uppercase text-[#0F62FE]">
                    What We Built
                  </span>
                </div>
                <h2 className="font-['Space_Grotesk'] text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] text-white uppercase">
                  A Macro-Financial<br />
                  <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.25)' }}>
                    Intelligence
                  </span><br />
                  Engine.
                </h2>
                <p className="font-['Inter'] text-[#C6C6C6] text-base leading-relaxed max-w-md">
                  ChainPulse synthesizes fragmented macro-economic signals — energy prices, trade flows, transport costs, supply chain congestion — into a single, actionable Global Systemic Stress Index (GSSI). No more guessing. No more noise.
                </p>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-1">
                {/* Step 1 */}
                <div className="p-10 border border-[#474747]/10 hover:bg-[#1F1F1F] transition-colors group relative overflow-hidden">
                  <div className="absolute top-0 right-0 font-['Space_Grotesk'] text-[120px] font-black text-[#1F1F1F] leading-none pointer-events-none select-none group-hover:text-[#0F62FE]/10 transition-colors">
                    01
                  </div>
                  <span className="font-['Inter'] text-[10px] text-[#0F62FE] tracking-[0.2em] uppercase mb-6 block relative z-10">
                    INGEST
                  </span>
                  <h3 className="font-['Space_Grotesk'] text-xl font-bold text-white uppercase tracking-tight mb-3 relative z-10">
                    Signal Capture
                  </h3>
                  <p className="font-['Inter'] text-sm text-[#C6C6C6] leading-relaxed relative z-10">
                    We ingest data from 42+ institutional gateways — central bank reports, commodity indices, shipping manifests, energy grids, and trade ledgers.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-10 border border-[#474747]/10 hover:bg-[#1F1F1F] transition-colors group relative overflow-hidden">
                  <div className="absolute top-0 right-0 font-['Space_Grotesk'] text-[120px] font-black text-[#1F1F1F] leading-none pointer-events-none select-none group-hover:text-[#0F62FE]/10 transition-colors">
                    02
                  </div>
                  <span className="font-['Inter'] text-[10px] text-[#0F62FE] tracking-[0.2em] uppercase mb-6 block relative z-10">
                    COMPUTE
                  </span>
                  <h3 className="font-['Space_Grotesk'] text-xl font-bold text-white uppercase tracking-tight mb-3 relative z-10">
                    Stress Synthesis
                  </h3>
                  <p className="font-['Inter'] text-sm text-[#C6C6C6] leading-relaxed relative z-10">
                    Our models decompose each signal into weighted stress factors — isolating energy, transport, trade, congestion, and inventory contributions.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-10 border border-[#474747]/10 hover:bg-[#1F1F1F] transition-colors group relative overflow-hidden">
                  <div className="absolute top-0 right-0 font-['Space_Grotesk'] text-[120px] font-black text-[#1F1F1F] leading-none pointer-events-none select-none group-hover:text-[#0F62FE]/10 transition-colors">
                    03
                  </div>
                  <span className="font-['Inter'] text-[10px] text-[#0F62FE] tracking-[0.2em] uppercase mb-6 block relative z-10">
                    PREDICT
                  </span>
                  <h3 className="font-['Space_Grotesk'] text-xl font-bold text-white uppercase tracking-tight mb-3 relative z-10">
                    Deviation Forecast
                  </h3>
                  <p className="font-['Inter'] text-sm text-[#C6C6C6] leading-relaxed relative z-10">
                    Predictive models identify structural anomalies before they manifest in price action — giving you 30-day forward visibility.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-10 border border-[#474747]/10 hover:bg-[#1F1F1F] transition-colors group relative overflow-hidden">
                  <div className="absolute top-0 right-0 font-['Space_Grotesk'] text-[120px] font-black text-[#1F1F1F] leading-none pointer-events-none select-none group-hover:text-[#0F62FE]/10 transition-colors">
                    04
                  </div>
                  <span className="font-['Inter'] text-[10px] text-[#0F62FE] tracking-[0.2em] uppercase mb-6 block relative z-10">
                    ACT
                  </span>
                  <h3 className="font-['Space_Grotesk'] text-xl font-bold text-white uppercase tracking-tight mb-3 relative z-10">
                    Executive Directives
                  </h3>
                  <p className="font-['Inter'] text-sm text-[#C6C6C6] leading-relaxed relative z-10">
                    AI-generated institutional-grade action plans with confidence ratings — hedge, rebalance, or monitor with precision.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CORE CAPABILITIES — Feature Bento ═══ */}
        <section id="features" className="relative px-8 py-32 bg-[#0E0E0E]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-16">
              <span className="h-[1px] w-12 bg-[#0F62FE]" />
              <span className="font-['Inter'] text-[10px] tracking-[0.4em] uppercase text-[#0F62FE]">
                Core Capabilities
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px]">
              {/* GSSI Monitoring */}
              <div className="p-12 border border-[#474747]/10 hover:bg-[#1F1F1F] transition-colors group">
                <span className="font-['Inter'] text-[10px] text-[#0F62FE] tracking-[0.2em] uppercase mb-8 block">
                  001 / MONITORING
                </span>
                <h3 className="font-['Space_Grotesk'] text-3xl font-bold text-white uppercase tracking-tighter mb-4">
                  GSSI<br />Monitoring
                </h3>
                <p className="font-['Inter'] text-sm text-[#C6C6C6] leading-relaxed mb-12">
                  Global Systemic Stress Index tracking in real-time. One number that captures the macro-economic health of the entire system.
                </p>
                <div className="h-16 w-full flex items-end gap-1">
                  {[25, 50, 75, 50, 100, 30, 80, 60, 90, 45].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-[#353535] group-hover:bg-[#0F62FE] transition-all duration-300"
                      style={{
                        height: `${h}%`,
                        transitionDelay: `${i * 40}ms`,
                        opacity: `${0.4 + (h / 100) * 0.6}`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Predictive Deviations */}
              <div className="p-12 border border-[#474747]/10 hover:bg-[#1F1F1F] transition-colors group">
                <span className="font-['Inter'] text-[10px] text-[#0F62FE] tracking-[0.2em] uppercase mb-8 block">
                  002 / PREDICTIVE
                </span>
                <h3 className="font-['Space_Grotesk'] text-3xl font-bold text-white uppercase tracking-tighter mb-4">
                  Predictive<br />Deviations
                </h3>
                <p className="font-['Inter'] text-sm text-[#C6C6C6] leading-relaxed mb-12">
                  Identify structural anomalies before they manifest using quantum-derived divergence logic and 30-day forward modeling.
                </p>
                <div className="relative h-16 w-full">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-[#474747]/30" />
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 64" preserveAspectRatio="none">
                    <path
                      d="M0,40 Q30,20 60,35 T120,25 Q150,15 200,30"
                      stroke="#0F62FE"
                      strokeWidth="2"
                      fill="none"
                      className="opacity-40 group-hover:opacity-100 transition-opacity duration-500"
                    />
                    <path
                      d="M0,45 Q30,50 60,40 T120,50 Q150,55 200,42"
                      stroke="#FFB4AB"
                      strokeWidth="1.5"
                      fill="none"
                      strokeDasharray="4,4"
                      className="opacity-30 group-hover:opacity-80 transition-opacity duration-500"
                    />
                  </svg>
                  <div className="absolute left-[30%] top-[30%] w-2 h-2 bg-[#0F62FE] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: '0 0 10px #0F62FE' }} />
                  <div className="absolute right-[33%] bottom-[25%] w-2 h-2 bg-[#FFB4AB] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: '0 0 10px #FFB4AB' }} />
                </div>
              </div>

              {/* Executive Directives */}
              <div className="p-12 border border-[#474747]/10 hover:bg-[#1F1F1F] transition-colors group">
                <span className="font-['Inter'] text-[10px] text-[#0F62FE] tracking-[0.2em] uppercase mb-8 block">
                  003 / DIRECTIVES
                </span>
                <h3 className="font-['Space_Grotesk'] text-3xl font-bold text-white uppercase tracking-tighter mb-4">
                  Executive<br />Directives
                </h3>
                <p className="font-['Inter'] text-sm text-[#C6C6C6] leading-relaxed mb-12">
                  Institutional-grade action plans generated from cross-referenced data points and historical precedent with confidence scoring.
                </p>
                <div className="space-y-3">
                  {[{ w: 70, label: 'HEDGE_ENERGY' }, { w: 40, label: 'REBALANCE' }, { w: 55, label: 'MONITOR' }].map((bar, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <span className="font-mono text-[9px] text-[#919191]">{bar.label}</span>
                        <span className="font-mono text-[9px] text-[#919191]">{bar.w}%</span>
                      </div>
                      <div className="h-1 w-full bg-[#353535] overflow-hidden">
                        <div
                          className="h-full bg-[#0F62FE] transition-all duration-1000 group-hover:translate-x-0 -translate-x-full"
                          style={{ width: `${bar.w}%`, transitionDelay: `${i * 200}ms` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ DEEP CAPABILITIES — Large Feature Spotlight ═══ */}
        <section id="capabilities" className="relative px-8 py-32">
          <div className="max-w-7xl mx-auto space-y-32">

            {/* Capability 1: Factor Decomposition */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <span className="font-['Inter'] text-[10px] text-[#0F62FE] tracking-[0.2em] uppercase block">
                  DEEP ANALYSIS
                </span>
                <h3 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-black tracking-tighter text-white uppercase leading-[0.9]">
                  Factor<br />Decomposition
                </h3>
                <p className="font-['Inter'] text-[#C6C6C6] text-base leading-relaxed max-w-md">
                  Understand exactly <em className="text-white not-italic font-semibold">why</em> stress is rising. Our factor decomposition breaks the GSSI into five weighted components — Energy, Transport, Trade, Congestion, and Inventory — so you know which lever to pull.
                </p>
                <div className="space-y-4 pt-4">
                  {[
                    { name: 'Energy', pct: 35, glow: true },
                    { name: 'Transport', pct: 20, glow: false },
                    { name: 'Trade', pct: 18, glow: false },
                    { name: 'Congestion', pct: 15, glow: false },
                    { name: 'Inventory', pct: 12, glow: false },
                  ].map((factor) => (
                    <div key={factor.name}>
                      <div className="flex justify-between mb-1">
                        <span className="font-['Inter'] text-xs uppercase tracking-wider text-[#C6C6C6]">{factor.name}</span>
                        <span className="font-['Space_Grotesk'] text-sm font-bold text-white">{factor.pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#353535]">
                        <div
                          className="h-full bg-[#0F62FE] transition-all duration-700"
                          style={{
                            width: `${factor.pct}%`,
                            boxShadow: factor.glow ? '0 0 20px rgba(15,98,254,0.6)' : 'none',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual element */}
              <div className="relative">
                <div className="border border-[#474747]/10 bg-[#0E0E0E] p-12">
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-['Inter'] text-[10px] text-[#0F62FE] tracking-[0.2em] uppercase">
                      STRESS_DECOMPOSITION_MATRIX
                    </span>
                    <span className="font-mono text-[9px] text-[#919191]">LIVE_FEED</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mb-8">
                    {Array.from({ length: 25 }, (_, i) => {
                      const intensity = [0.9, 0.6, 0.4, 0.3, 0.2, 0.7, 0.5, 0.3, 0.2, 0.1, 0.5, 0.4, 0.35, 0.2, 0.15, 0.4, 0.3, 0.25, 0.2, 0.1, 0.3, 0.2, 0.15, 0.1, 0.05][i]
                      return (
                        <div
                          key={i}
                          className="aspect-square transition-all duration-500"
                          style={{
                            backgroundColor: `rgba(15,98,254,${intensity})`,
                          }}
                        />
                      )
                    })}
                  </div>
                  <div className="flex justify-between">
                    {['ENR', 'TRN', 'TRD', 'CNG', 'INV'].map((label) => (
                      <span key={label} className="font-mono text-[9px] text-[#919191]">{label}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Capability 2: Market Implications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Visual element left */}
              <div className="order-2 lg:order-1">
                <div className="border border-[#474747]/10 bg-[#0E0E0E] p-8">
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-['Inter'] text-[10px] text-[#0F62FE] tracking-[0.2em] uppercase">
                      IMPLICATIONS_LEDGER
                    </span>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#474747]/20">
                        <th className="text-left py-3 font-['Inter'] text-[9px] tracking-wider uppercase text-[#919191]">Event_Hash</th>
                        <th className="text-left py-3 font-['Inter'] text-[9px] tracking-wider uppercase text-[#919191]">Magnitude</th>
                        <th className="text-right py-3 font-['Inter'] text-[9px] tracking-wider uppercase text-[#919191]">Probability</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { hash: 'TX_001_VIX_SPIKE', mag: 'HIGH_ALERT', prob: '0.124' },
                        { hash: 'TX_002_ENERGY_SURGE', mag: 'HIGH_ALERT', prob: '0.098' },
                        { hash: 'TX_003_LIQ_DRAIN', mag: 'NOMINAL', prob: '0.741' },
                        { hash: 'TX_004_TRADE_SHIFT', mag: 'ELEVATED', prob: '0.382' },
                      ].map((row) => (
                        <tr key={row.hash} className="border-b border-[#474747]/10 hover:bg-[#1F1F1F] transition-colors">
                          <td className="py-4 font-mono text-xs text-white">{row.hash}</td>
                          <td className="py-4">
                            <span className={`font-mono text-[9px] px-2 py-1 uppercase ${
                              row.mag === 'HIGH_ALERT'
                                ? 'bg-[#93000A] text-[#FFB4AB]'
                                : row.mag === 'ELEVATED'
                                ? 'bg-[#0F62FE]/20 text-[#0F62FE]'
                                : 'bg-[#353535] text-[#C6C6C6]'
                            }`}>
                              {row.mag}
                            </span>
                          </td>
                          <td className="py-4 font-['Space_Grotesk'] text-2xl font-bold text-white text-right">
                            {row.prob}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-6 order-1 lg:order-2">
                <span className="font-['Inter'] text-[10px] text-[#0F62FE] tracking-[0.2em] uppercase block">
                  INSTITUTIONAL INTELLIGENCE
                </span>
                <h3 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-black tracking-tighter text-white uppercase leading-[0.9]">
                  Market<br />Implications
                </h3>
                <p className="font-['Inter'] text-[#C6C6C6] text-base leading-relaxed max-w-md">
                  Every market event is hashed, classified, and assigned a probability score. Our implications ledger maps cascading effects across asset classes — from VIX spikes to liquidity drains — so you see the full chain of consequences.
                </p>
                <div className="flex items-center gap-6 pt-4">
                  <div className="text-center">
                    <span className="font-['Space_Grotesk'] text-4xl font-black text-white block">42+</span>
                    <span className="font-['Inter'] text-[9px] tracking-[0.2em] uppercase text-[#919191]">Gateways</span>
                  </div>
                  <div className="w-px h-12 bg-[#474747]/30" />
                  <div className="text-center">
                    <span className="font-['Space_Grotesk'] text-4xl font-black text-white block">5</span>
                    <span className="font-['Inter'] text-[9px] tracking-[0.2em] uppercase text-[#919191]">Stress Factors</span>
                  </div>
                  <div className="w-px h-12 bg-[#474747]/30" />
                  <div className="text-center">
                    <span className="font-['Space_Grotesk'] text-4xl font-black text-white block">30d</span>
                    <span className="font-['Inter'] text-[9px] tracking-[0.2em] uppercase text-[#919191]">Forward</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CTA SECTION ═══ */}
        <section className="relative px-8 py-32 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,98,254,0.06)_0%,transparent_60%)]" />
          <div className="max-w-4xl mx-auto text-center relative z-20 space-y-8">
            <span className="font-['Inter'] text-[10px] text-[#0F62FE] tracking-[0.4em] uppercase block">
              ENTER THE TERMINAL
            </span>
            <h2 className="font-['Space_Grotesk'] text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-[0.85]">
              See the Stress<br />
              <span className="bg-gradient-to-r from-[#0F62FE] to-blue-800 bg-clip-text text-transparent">
                Before the Market Does.
              </span>
            </h2>
            <p className="font-['Inter'] text-[#C6C6C6] text-lg leading-relaxed max-w-xl mx-auto">
              Access real-time GSSI tracking, predictive deviation models, factor decomposition, and AI-generated executive directives — all in one terminal.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                to="/dashboard"
                className="bg-[#0052dd] text-white px-10 py-4 font-['Space_Grotesk'] text-sm font-bold uppercase tracking-widest active:scale-95 duration-100 ease-linear hover:bg-[#0F62FE] inline-block text-center"
              >
                Open Analytics
              </Link>
              <Link
                to="/portfolio"
                className="border border-[#474747] text-white px-10 py-4 font-['Space_Grotesk'] text-sm font-bold uppercase tracking-widest hover:bg-[#1F1F1F] transition-colors duration-100 text-center inline-block"
              >
                View Strategy
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ TRUST SECTION ═══ */}
        <section className="py-24 border-t border-[#474747]/10">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12">
              <span className="font-['Inter'] text-[10px] tracking-[0.4em] uppercase text-[#C6C6C6] whitespace-nowrap">
                Integrated by the World's Elite Analysts
              </span>
              <div className="flex flex-wrap justify-center gap-16 opacity-40 grayscale">
                <div className="font-['Space_Grotesk'] text-2xl font-black text-white tracking-tighter">GOLDMAN_V</div>
                <div className="font-['Space_Grotesk'] text-2xl font-black text-white tracking-tighter">BLACK_ROCK</div>
                <div className="font-['Space_Grotesk'] text-2xl font-black text-white tracking-tighter">JPM_SYSTEMS</div>
                <div className="font-['Space_Grotesk'] text-2xl font-black text-white tracking-tighter">BRIDGE_HQ</div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ TICKER TAPE ═══ */}
        <div className="fixed bottom-0 w-full h-8 bg-[#0E0E0E] border-t border-[#474747]/10 z-40 overflow-hidden flex items-center">
          <div className="flex whitespace-nowrap gap-12 animate-ticker">
            {[...Array(2)].map((_, j) => (
              <div key={j} className="flex whitespace-nowrap gap-12">
                <span className="font-['Inter'] text-[10px] text-[#C6C6C6] uppercase">BTC/USD <span className="text-[#0F62FE]">64,281.04</span> (+2.4%)</span>
                <span className="font-['Inter'] text-[10px] text-[#C6C6C6] uppercase">ETH/USD <span className="text-[#0F62FE]">3,451.92</span> (+1.1%)</span>
                <span className="font-['Inter'] text-[10px] text-[#C6C6C6] uppercase">GSSI_STRESS <span className="text-[#FFB4AB]">HIGH</span> (0.882)</span>
                <span className="font-['Inter'] text-[10px] text-[#C6C6C6] uppercase">SYSTEM_LOAD <span className="text-[#0F62FE]">OPTIMAL</span></span>
                <span className="font-['Inter'] text-[10px] text-[#C6C6C6] uppercase">GLOBAL_VOL_INDEX <span className="text-white">24.8</span></span>
                <span className="font-['Inter'] text-[10px] text-[#C6C6C6] uppercase">SOL/USD <span className="text-[#0F62FE]">145.02</span> (+4.81%)</span>
                <span className="font-['Inter'] text-[10px] text-[#C6C6C6] uppercase">AVAX/USD <span className="text-[#0F62FE]">38.12</span> (+0.11%)</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="w-full border-t border-neutral-800/20 bg-neutral-950 px-8 py-12 pb-24">
        <div className="flex flex-col md:flex-row justify-between items-center w-full">
          <div className="text-neutral-600 font-['Inter'] text-[10px] tracking-[0.1em] uppercase mb-8 md:mb-0">
            © 2024 CHAINPULSE ARCHITECTURE. BUILD_V.2.0.48-STABLE
          </div>
          <div className="flex flex-wrap gap-8 justify-center">
            <a className="font-['Inter'] text-[10px] tracking-[0.1em] text-neutral-600 uppercase hover:text-white transition-colors duration-150" href="#">SLA AGREEMENT</a>
            <a className="font-['Inter'] text-[10px] tracking-[0.1em] text-neutral-600 uppercase hover:text-white transition-colors duration-150" href="#">TERMINAL_PROTOCOLS</a>
            <a className="font-['Inter'] text-[10px] tracking-[0.1em] text-neutral-600 uppercase hover:text-white transition-colors duration-150" href="#">SYSTEM_STATUS</a>
            <a className="font-['Inter'] text-[10px] tracking-[0.1em] text-neutral-600 uppercase hover:text-white transition-colors duration-150" href="#">PRIVACY_ENCRYPTION</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
