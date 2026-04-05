import React, { useState, useRef, useEffect, useCallback, type DragEvent, type FormEvent, type KeyboardEvent } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { useChat, usePortfolioCache, usePortfolioUpload } from '@/hooks/useChat'
import type { ChatMessage, CachedPortfolio } from '@/types/chat'

/* ═══════════════════════════════════════════════════════════════
   QUICK_PROMPTS
   ═══════════════════════════════════════════════════════════════ */
const QUICK_PROMPTS = [
  { label: 'Why is GSSI rising?', icon: 'trending_up' },
  { label: 'Energy exposure analysis', icon: 'bolt' },
  { label: 'Portfolio risk breakdown', icon: 'shield' },
  { label: 'What should I hedge?', icon: 'swap_vert' },
  { label: 'Cross-sector stress map', icon: 'hub' },
  { label: 'Forecast vs. current', icon: 'timeline' },
]

const BROKER_PLACEHOLDERS = [
  { name: 'Schwab', materialIcon: 'account_balance', color: '#00A0DF' },
  { name: 'Fidelity', materialIcon: 'monitoring', color: '#4CAF50' },
  { name: 'Interactive Brokers', materialIcon: 'candlestick_chart', color: '#D32F2F' },
  { name: 'Robinhood', materialIcon: 'show_chart', color: '#00C805' },
]

/* ═══════════════════════════════════════════════════════════════
   ChatPage
   ═══════════════════════════════════════════════════════════════ */
export function ChatPage() {
  const { cached, savePortfolio, clearPortfolio, timeRemaining } = usePortfolioCache()
  const { messages, sendMessage, clearChat, isLoading, error } = useChat(cached?.data ?? null)
  const uploadMutation = usePortfolioUpload((data, filename) => savePortfolio(data, filename))

  const [input, setInput] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = useCallback((e?: FormEvent) => {
    e?.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    setInput('')
    sendMessage(trimmed)
  }, [input, isLoading, sendMessage])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  const handleQuickPrompt = useCallback((prompt: string) => {
    if (isLoading) return
    sendMessage(prompt)
  }, [isLoading, sendMessage])

  // File upload handlers
  const handleFileDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf') || file.name.endsWith('.csv'))) {
      uploadMutation.mutate(file)
    }
  }, [uploadMutation])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadMutation.mutate(file)
    }
  }, [uploadMutation])

  return (
    <div className="min-h-screen bg-[#131313] text-[#E2E2E2]">
      <Sidebar />

      {/* ═══ Main Content ═══ */}
      <div className="ml-20 flex h-screen">

        {/* ═══ LEFT PANEL — Portfolio Intelligence ═══ */}
        <aside className="w-80 border-r border-[#2A2A2A]/50 flex flex-col bg-[#131313] overflow-y-auto shrink-0">

          {/* Panel header */}
          <div className="px-6 py-6 border-b border-[#2A2A2A]/50">
            <div className="flex items-center gap-3 mb-1">
              <span className="material-symbols-outlined text-[#0F62FE] text-xl">account_balance</span>
              <span className="font-['Space_Grotesk'] text-sm font-bold tracking-wider uppercase text-[#C6C6C6]">
                Portfolio Intel
              </span>
            </div>
            <p className="text-[10px] text-[#6F6F6F] font-['Inter'] leading-relaxed mt-2">
              Upload your portfolio to get personalized analysis cross-referenced with ChainPulse stress data.
            </p>
          </div>

          {/* Upload zone */}
          <div className="px-6 py-5 border-b border-[#2A2A2A]/50">
            <span className="font-['Inter'] text-[9px] tracking-widest uppercase text-[#474747] block mb-3">
              Upload Portfolio
            </span>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-sm p-6 text-center cursor-pointer
                transition-all duration-200
                ${isDragOver
                  ? 'border-[#0F62FE] bg-[#0F62FE]/5'
                  : 'border-[#2A2A2A] hover:border-[#474747] bg-[#1A1A1A]'
                }
                ${uploadMutation.isPending ? 'pointer-events-none opacity-60' : ''}
              `}
            >
              {uploadMutation.isPending ? (
                <>
                  <div className="w-6 h-6 border-2 border-[#0F62FE] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-[11px] text-[#C6C6C6] font-['Inter']">Parsing portfolio...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[#474747] text-3xl block mb-2">
                    cloud_upload
                  </span>
                  <span className="text-[11px] text-[#C6C6C6] font-['Inter'] block">
                    Drop PDF here
                  </span>
                  <span className="text-[9px] text-[#474747] font-['Inter'] block mt-1">
                    or click to browse
                  </span>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />

            {uploadMutation.isError && (
              <div className="mt-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-sm">
                <span className="text-[10px] text-red-400 font-['Inter']">
                  {uploadMutation.error?.message || 'Upload failed'}
                </span>
              </div>
            )}
          </div>

          {/* Cached portfolio summary */}
          {cached && (
            <div className="px-6 py-5 border-b border-[#2A2A2A]/50">
              <div className="flex items-center justify-between mb-3">
                <span className="font-['Inter'] text-[9px] tracking-widest uppercase text-[#0F62FE]">
                  Portfolio Loaded
                </span>
                <button
                  onClick={clearPortfolio}
                  className="text-[9px] text-[#6F6F6F] hover:text-red-400 font-['Inter'] uppercase tracking-wider transition-colors"
                >
                  Clear
                </button>
              </div>

              <PortfolioSummaryCard cached={cached} timeRemaining={timeRemaining} />
            </div>
          )}

          {/* Broker connect (placeholder) */}
          <div className="px-6 py-5 border-b border-[#2A2A2A]/50">
            <span className="font-['Inter'] text-[9px] tracking-widest uppercase text-[#474747] block mb-3">
              Broker Connect
            </span>
            <div className="grid grid-cols-2 gap-2">
              {BROKER_PLACEHOLDERS.map(broker => (
                <div
                  key={broker.name}
                  className="relative px-3 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm text-center cursor-not-allowed group hover:border-[#474747] transition-all duration-200"
                >
                  <span
                    className="material-symbols-outlined text-xl block mb-1 transition-colors duration-200"
                    style={{ color: broker.color, opacity: 0.6 }}
                  >
                    {broker.materialIcon}
                  </span>
                  <span className="text-[9px] text-[#6F6F6F] font-['Inter'] block">{broker.name}</span>
                  <div className="absolute inset-0 bg-[#131313]/85 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <span className="text-[8px] text-[#0F62FE] font-['Space_Grotesk'] font-bold uppercase tracking-widest">
                      Coming Soon
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data sources status */}
          <div className="px-6 py-5 mt-auto">
            <span className="font-['Inter'] text-[9px] tracking-widest uppercase text-[#474747] block mb-3">
              Active Data Feeds
            </span>
            <div className="space-y-2">
              {[
                { name: 'GSSI Index', active: true },
                { name: 'Driver Decomposition', active: true },
                { name: 'Forecast Engine', active: true },
                { name: 'Portfolio Strategy', active: true },
                { name: 'Intelligence Feed', active: true },
                { name: 'User Portfolio', active: !!cached },
              ].map(feed => (
                <div key={feed.name} className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${feed.active ? 'bg-green-500' : 'bg-[#474747]'}`} />
                  <span className={`text-[10px] font-['Inter'] ${feed.active ? 'text-[#C6C6C6]' : 'text-[#474747]'}`}>
                    {feed.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ═══ RIGHT PANEL — Chat Interface ═══ */}
        <main className="flex-1 flex flex-col min-w-0">

          {/* Chat header */}
          <div className="px-8 py-5 border-b border-[#2A2A2A]/50 flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-['Inter'] text-[9px] tracking-[0.3em] uppercase text-[#0F62FE]">
                  AI_ENGINE / ANALYST_CHAT
                </span>
              </div>
              <h1 className="font-['Space_Grotesk'] text-3xl font-black tracking-tight text-white leading-none">
                CISCO<span className="text-[#474747]">_ANALYST</span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right mr-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-['Inter'] text-[9px] tracking-wider uppercase text-[#474747]">Online</span>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#2A2A2A] hover:border-[#474747] text-[#6F6F6F] hover:text-[#C6C6C6] transition-all duration-150 text-[10px] font-['Space_Grotesk'] uppercase tracking-widest hover:bg-[#1F1F1F]"
                >
                  <span className="material-symbols-outlined text-xs">delete</span>
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {messages.length === 0 && !isLoading ? (
              <EmptyState onQuickPrompt={handleQuickPrompt} />
            ) : (
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map(msg => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}

                {isLoading && <TypingIndicator />}

                {error && !isLoading && (
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-red-400 text-sm">error</span>
                    </div>
                    <div className="px-4 py-3 bg-red-500/5 border border-red-500/15 rounded-sm">
                      <span className="text-xs text-red-400 font-['Inter']">{error}</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input bar */}
          <div className="px-8 py-4 border-t border-[#2A2A2A]/50 shrink-0">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about GSSI, drivers, portfolio risk, sector exposure..."
                rows={1}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#0F62FE] text-[#E2E2E2] placeholder-[#474747] px-5 py-4 pr-14 font-['Inter'] text-sm outline-none resize-none transition-colors rounded-sm"
                style={{ minHeight: '52px', maxHeight: '120px' }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-[#0F62FE] hover:bg-[#0052dd] disabled:bg-[#2A2A2A] disabled:text-[#474747] text-white transition-all duration-100 active:scale-95 rounded-sm"
              >
                <span className="material-symbols-outlined text-lg">
                  {isLoading ? 'hourglass_top' : 'arrow_upward'}
                </span>
              </button>
            </form>
            <div className="max-w-4xl mx-auto mt-2 flex items-center justify-between">
              <span className="text-[9px] text-[#393939] font-['Inter']">
                Press Enter to send · Shift+Enter for new line
              </span>
              <span className="text-[10px] text-[#0F62FE]/80 font-['Inter'] flex items-center gap-1 bg-[#0F62FE]/5 border border-[#0F62FE]/20 px-2 py-0.5 rounded-sm">
                <span className="material-symbols-outlined text-[11px] animate-pulse">shield_locked</span>
                Test Env Quota: 5 Interactions / Hr
              </span>
              <span className="text-[9px] text-[#393939] font-['Inter'] flex items-center gap-1">
                <span className="material-symbols-outlined text-[10px]">{cached ? 'folder_open' : 'folder_off'}</span>
                {cached ? 'Portfolio active' : 'No portfolio uploaded'} · {messages.length} messages
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-20 right-0 h-6 bg-[#1A1A1A] border-t border-[#2A2A2A]/30 flex items-center justify-between px-6 z-40">
        <span className="font-['Space_Grotesk'] text-[9px] tracking-wider text-[#393939]">
          QUANTUM_LEDGER_V1.0.4 // [STABLE_BUILD]
        </span>
        <div className="flex items-center gap-4">
          <span className="text-[#393939] text-[9px] font-['Inter']">Privacy.md</span>
          <span className="text-[#393939] text-[9px] font-['Inter']">SLA.txt</span>
          <span className="text-[#393939] text-[9px] font-['Inter'] flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
            Node_Status: ACTIVE
          </span>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   EmptyState — Shown when no messages
   ═══════════════════════════════════════════════════════════════ */
function EmptyState({ onQuickPrompt }: { onQuickPrompt: (prompt: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto">
      {/* Hero icon with animated ring */}
      <div className="relative w-20 h-20 flex items-center justify-center mb-8">
        <div className="absolute inset-0 border border-[#0F62FE]/20 animate-[spin_8s_linear_infinite] rounded-full" />
        <div className="absolute inset-1 border border-[#2A2A2A] rounded-full" />
        <div className="w-14 h-14 bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center rounded-full">
          <span className="material-symbols-outlined text-3xl text-[#0F62FE]" style={{ fontVariationSettings: "'FILL' 1" }}>
            psychology
          </span>
        </div>
      </div>

      <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white tracking-tight mb-2">
        Ask Cisco
      </h2>
      <p className="text-sm text-[#6F6F6F] font-['Inter'] text-center max-w-md mb-8 leading-relaxed">
        Query all ChainPulse data surfaces in natural language. Cisco cross-references GSSI, driver decomposition,
        forecasts, portfolio strategy, and your uploaded holdings — in one response.
      </p>

      {/* Quick prompts grid */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
        {QUICK_PROMPTS.map(prompt => (
          <button
            key={prompt.label}
            onClick={() => onQuickPrompt(prompt.label)}
            className="flex items-center gap-3 px-4 py-3.5 bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#0F62FE]/40 hover:bg-[#1F1F1F] text-left transition-all duration-200 group rounded-sm hover:translate-x-0.5"
          >
            <span className="material-symbols-outlined text-[#474747] group-hover:text-[#0F62FE] transition-colors text-lg">
              {prompt.icon}
            </span>
            <span className="text-[11px] text-[#C6C6C6] font-['Inter'] leading-snug">
              {prompt.label}
            </span>
          </button>
        ))}
      </div>

      {/* Capability badges */}
      <div className="flex gap-6 mt-10">
        {['Multi-source citations', 'Portfolio cross-reference', 'Real-time data'].map(badge => (
          <span key={badge} className="text-[9px] text-[#474747] font-['Inter'] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1 h-1 bg-[#0F62FE] rounded-full" />
            {badge}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MessageBubble — Renders individual messages
   ═══════════════════════════════════════════════════════════════ */
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] px-5 py-3.5 bg-[#0F62FE] text-white rounded-sm">
          <p className="text-sm font-['Inter'] leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center shrink-0 mt-1 rounded-full">
        <span className="material-symbols-outlined text-[#0F62FE] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
          psychology
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] text-[#0F62FE] font-['Space_Grotesk'] uppercase tracking-widest font-bold">
            CISCO
          </span>
          <span className="text-[9px] text-[#393939] font-['Inter']">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="prose-chainpulse">
          <MarkdownRenderer content={message.content} />
        </div>

        {/* Citation chips */}
        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#2A2A2A]/30">
            <span className="text-[8px] text-[#474747] font-['Inter'] uppercase tracking-wider self-center mr-1">Sources:</span>
            {message.citations.slice(0, 8).map((citation, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#0F62FE]/5 border border-[#0F62FE]/15 text-[9px] text-[#0F62FE] font-['Inter'] rounded-sm"
              >
                <span className="text-[#474747]">{citation.source}→</span>
                {citation.metric}: {citation.value}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MarkdownRenderer — Simple markdown-to-JSX
   ═══════════════════════════════════════════════════════════════ */
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: string[] = []
  let listKey = 0

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${listKey}`} className="list-disc list-inside space-y-1.5 my-2 ml-1">
          {listItems.map((item, i) => (
            <li key={i} className="text-sm text-[#C6C6C6] font-['Inter'] leading-relaxed">
              <InlineFormat text={item} />
            </li>
          ))}
        </ul>
      )
      listItems = []
      listKey++
    }
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim()

    // Headers
    if (trimmed.startsWith('### ')) {
      flushList()
      elements.push(
        <h4 key={idx} className="font-['Space_Grotesk'] text-sm font-bold text-[#E2E2E2] mt-4 mb-1 tracking-tight">
          {trimmed.slice(4)}
        </h4>
      )
    } else if (trimmed.startsWith('## ')) {
      flushList()
      elements.push(
        <h3 key={idx} className="font-['Space_Grotesk'] text-base font-bold text-white mt-5 mb-2 tracking-tight">
          {trimmed.slice(3)}
        </h3>
      )
    }
    // Bullet points
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listItems.push(trimmed.slice(2))
    }
    // Numbered list
    else if (/^\d+\.\s/.test(trimmed)) {
      listItems.push(trimmed.replace(/^\d+\.\s/, ''))
    }
    // Horizontal rule
    else if (trimmed === '---' || trimmed === '***') {
      flushList()
      elements.push(<hr key={idx} className="border-[#2A2A2A] my-4" />)
    }
    // Regular paragraph
    else if (trimmed) {
      flushList()
      elements.push(
        <p key={idx} className="text-sm text-[#C6C6C6] font-['Inter'] leading-relaxed my-1.5">
          <InlineFormat text={trimmed} />
        </p>
      )
    }
    // Blank line
    else {
      flushList()
    }
  })

  flushList()

  return <>{elements}</>
}

/* ═══════════════════════════════════════════════════════════════
   InlineFormat — Bold, citations, code
   ═══════════════════════════════════════════════════════════════ */
function InlineFormat({ text }: { text: string }) {
  // Parse bold (**text**), inline code (`code`), and citations [Source → Metric: Value]
  const parts: React.ReactNode[] = []
  let remaining = text
  let keyIdx = 0

  while (remaining.length > 0) {
    // Citation pattern
    const citationMatch = remaining.match(/\[([^\]]+?)\s*→\s*([^:\]]+):\s*([^\]]+)\]/)
    // Bold pattern
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/)
    // Code pattern
    const codeMatch = remaining.match(/`([^`]+)`/)

    // Find earliest match
    const matches = [
      citationMatch ? { type: 'citation', match: citationMatch, index: citationMatch.index! } : null,
      boldMatch ? { type: 'bold', match: boldMatch, index: boldMatch.index! } : null,
      codeMatch ? { type: 'code', match: codeMatch, index: codeMatch.index! } : null,
    ].filter(Boolean) as Array<{ type: string; match: RegExpMatchArray; index: number }>

    if (matches.length === 0) {
      parts.push(<span key={keyIdx++}>{remaining}</span>)
      break
    }

    const earliest = matches.reduce((a, b) => a.index < b.index ? a : b)

    // Text before match
    if (earliest.index > 0) {
      parts.push(<span key={keyIdx++}>{remaining.slice(0, earliest.index)}</span>)
    }

    if (earliest.type === 'citation') {
      const [, source, metric, value] = earliest.match
      parts.push(
        <span key={keyIdx++} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#0F62FE]/8 border border-[#0F62FE]/20 text-[11px] text-[#0F62FE] font-['Inter'] rounded-sm mx-0.5 font-medium">
          <span className="text-[#6F6F6F] text-[9px]">{source}→</span>{metric}: {value}
        </span>
      )
    } else if (earliest.type === 'bold') {
      parts.push(
        <strong key={keyIdx++} className="text-white font-semibold">{earliest.match[1]}</strong>
      )
    } else if (earliest.type === 'code') {
      parts.push(
        <code key={keyIdx++} className="bg-[#2A2A2A] px-1.5 py-0.5 text-[#0F62FE] text-xs font-mono rounded-sm">
          {earliest.match[1]}
        </code>
      )
    }

    remaining = remaining.slice(earliest.index + earliest.match[0].length)
  }

  return <>{parts}</>
}

/* ═══════════════════════════════════════════════════════════════
   TypingIndicator
   ═══════════════════════════════════════════════════════════════ */
function TypingIndicator() {
  const [dots, setDots] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setDots(d => (d + 1) % 4), 400)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center shrink-0 rounded-full">
        <span className="material-symbols-outlined text-[#0F62FE] text-sm animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
          psychology
        </span>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        <span className="text-[9px] text-[#0F62FE] font-['Space_Grotesk'] uppercase tracking-widest font-bold">
          CISCO
        </span>
        <div className="px-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm space-y-1.5 font-mono text-[11px]">
          <p className="text-[#474747]">
            <span className="text-[#0F62FE]">{'>'}</span> Querying data surfaces{'.'.repeat(dots)}
          </p>
          <p className="text-[#393939]">
            <span className="text-[#0F62FE]">{'>'}</span> GSSI_INDEX: loaded
          </p>
          <p className="text-[#393939]">
            <span className="text-[#0F62FE]">{'>'}</span> DRIVER_MATRIX: loaded
          </p>
          <p className="text-[#474747] animate-pulse">
            <span className="text-[#0F62FE]">{'>'}</span> INFERENCE_ACTIVE
          </p>
          <div className="h-0.5 w-full bg-[#2A2A2A] mt-2 overflow-hidden rounded-full">
            <div className="h-full bg-[#0F62FE] rounded-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PortfolioSummaryCard — Shows cached portfolio details
   ═══════════════════════════════════════════════════════════════ */
function PortfolioSummaryCard({ cached, timeRemaining }: { cached: CachedPortfolio; timeRemaining: number }) {
  const hoursLeft = Math.floor(timeRemaining / (60 * 60 * 1000))
  const { summary, holdings } = cached.data

  return (
    <div className="space-y-3">
      {/* File info */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#0F62FE]/5 border border-[#0F62FE]/15 rounded-sm">
        <span className="material-symbols-outlined text-[#0F62FE] text-sm">description</span>
        <span className="text-[10px] text-[#C6C6C6] font-['Inter'] truncate flex-1">{cached.filename}</span>
        <span className="text-[8px] text-[#474747] font-['Inter']">{hoursLeft}h left</span>
      </div>

      {/* Total value + holdings count */}
      <div className="grid grid-cols-2 gap-2">
        <div className="px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm">
          <span className="text-[8px] text-[#474747] font-['Inter'] uppercase tracking-wider block">Value</span>
          <span className="text-sm text-white font-['Space_Grotesk'] font-bold">
            ${(summary.totalValue / 1000).toFixed(0)}K
          </span>
        </div>
        <div className="px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm">
          <span className="text-[8px] text-[#474747] font-['Inter'] uppercase tracking-wider block">Holdings</span>
          <span className="text-sm text-white font-['Space_Grotesk'] font-bold">{holdings.length}</span>
        </div>
      </div>

      {/* Top holdings */}
      {summary.topHoldings && summary.topHoldings.length > 0 && (
        <div className="space-y-1">
          <span className="text-[8px] text-[#474747] font-['Inter'] uppercase tracking-wider">Top Holdings</span>
          <div className="flex flex-wrap gap-1">
            {summary.topHoldings.slice(0, 5).map(ticker => (
              <span key={ticker} className="px-2 py-0.5 bg-[#2A2A2A] text-[9px] text-[#C6C6C6] font-['Space_Grotesk'] font-bold rounded-sm">
                ${ticker}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sector breakdown */}
      {summary.sectorBreakdown && (
        <div className="space-y-1.5">
          <span className="text-[8px] text-[#474747] font-['Inter'] uppercase tracking-wider">Sectors</span>
          {Object.entries(summary.sectorBreakdown).slice(0, 5).map(([sector, weight]) => (
            <div key={sector} className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-[#2A2A2A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0F62FE] rounded-full"
                  style={{ width: `${Math.min(weight as number, 100)}%` }}
                />
              </div>
              <span className="text-[9px] text-[#C6C6C6] font-['Inter'] w-24 truncate">{sector}</span>
              <span className="text-[9px] text-[#474747] font-['Inter'] w-8 text-right">{(weight as number).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
