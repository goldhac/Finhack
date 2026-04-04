/* ═══ Chat Types ═══ */

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
  timestamp: number
}

export interface Citation {
  metric: string
  value: string
  source: string
}

/* ═══ Portfolio Upload Types ═══ */

export interface PortfolioHolding {
  ticker: string
  name: string
  shares: number
  value: number
  sector: string
  weight?: number
}

export interface PortfolioSummary {
  totalValue: number
  totalHoldings: number
  sectorBreakdown: Record<string, number>
  topHoldings: string[]
  riskNotes?: string
}

export interface ParsedPortfolio {
  holdings: PortfolioHolding[]
  summary: PortfolioSummary
}

export interface CachedPortfolio {
  data: ParsedPortfolio
  uploadedAt: number
  filename: string
}

/* ═══ API Request/Response ═══ */

export interface ChatRequest {
  message: string
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
  dashboardContext?: Record<string, unknown>
  portfolioContext?: Record<string, unknown>
  userPortfolio?: ParsedPortfolio | null
}

export interface ChatResponse {
  success: boolean
  data: {
    content: string
    citations: Citation[]
    timestamp: number
  }
  error?: string
}

export interface ParsePortfolioRequest {
  fileBase64: string
  mimeType: string
  filename: string
}

export interface ParsePortfolioResponse {
  success: boolean
  data: ParsedPortfolio
  error?: string
}
