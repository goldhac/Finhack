import { useState, useCallback, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import type {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ParsePortfolioResponse,
  ParsedPortfolio,
  CachedPortfolio,
} from '@/types/chat'

// ── Portfolio mock data (still used until portfolio page is wired to API) ──
import { regimeContextMock } from '@/data/portfolio/regime.mock'
import { allocationsMock } from '@/data/portfolio/allocations.mock'
import { sectorsMock } from '@/data/portfolio/sectors.mock'
import { equitiesMock } from '@/data/portfolio/equities.mock'
import { systemicDriversMock } from '@/data/portfolio/drivers.mock'
import { intelligenceMock } from '@/data/portfolio/intelligence.mock'
import { protocolsMock } from '@/data/portfolio/protocols.mock'

const PORTFOLIO_CACHE_KEY = 'chainpulse_user_portfolio'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

/* ═══════════════════════════════════════════════════════════════
   usePortfolioCache — localStorage with TTL
   ═══════════════════════════════════════════════════════════════ */
export function usePortfolioCache() {
  const [cached, setCached] = useState<CachedPortfolio | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PORTFOLIO_CACHE_KEY)
      if (raw) {
        const parsed: CachedPortfolio = JSON.parse(raw)
        const age = Date.now() - parsed.uploadedAt
        if (age < CACHE_TTL_MS) {
          setCached(parsed)
        } else {
          localStorage.removeItem(PORTFOLIO_CACHE_KEY)
        }
      }
    } catch {
      localStorage.removeItem(PORTFOLIO_CACHE_KEY)
    }
  }, [])

  const savePortfolio = useCallback((data: ParsedPortfolio, filename: string) => {
    const entry: CachedPortfolio = { data, uploadedAt: Date.now(), filename }
    localStorage.setItem(PORTFOLIO_CACHE_KEY, JSON.stringify(entry))
    setCached(entry)
  }, [])

  const clearPortfolio = useCallback(() => {
    localStorage.removeItem(PORTFOLIO_CACHE_KEY)
    setCached(null)
  }, [])

  const timeRemaining = cached
    ? Math.max(0, CACHE_TTL_MS - (Date.now() - cached.uploadedAt))
    : 0

  return { cached, savePortfolio, clearPortfolio, timeRemaining }
}

/* ═══════════════════════════════════════════════════════════════
   useChat — Message state + API mutation
   ═══════════════════════════════════════════════════════════════ */
export function useChat(userPortfolio: ParsedPortfolio | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])

  // Dashboard context is fetched live from the API at send-time so CISCO
  // always has the most recent GSSI data injected into the conversation.
  const fetchDashboardContext = async () => {
    try {
      const [overview, drivers, forecast, implications, recommendations] = await Promise.all([
        apiFetch('/gssi/summary'),
        apiFetch('/gssi/drivers'),
        apiFetch('/gssi/forecast'),
        apiFetch('/gssi/implications'),
        apiFetch('/gssi/recommendations'),
      ])
      return { overview, drivers, forecast, implications, recommendations }
    } catch {
      return null
    }
  }

  const portfolioContext = {
    regime: regimeContextMock,
    allocations: allocationsMock,
    sectors: sectorsMock,
    equities: equitiesMock,
    systemicDrivers: systemicDriversMock,
    intelligence: intelligenceMock,
    protocols: protocolsMock,
  }

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      // Build history (skip first system messages, take last 20)
      const history = messages.slice(-20).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

      const dashboardContext = await fetchDashboardContext() ?? undefined

      const payload: ChatRequest = {
        message,
        history,
        dashboardContext,
        portfolioContext,
        userPortfolio,
      }

      return apiFetch<ChatResponse>('/chat/message', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },
    onSuccess: (response) => {
      // Add assistant response (user message already added optimistically in sendMessage)
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.data.content,
        citations: response.data.citations,
        timestamp: response.data.timestamp,
      }

      setMessages(prev => [...prev, assistantMsg])
    },
  })

  const sendMessage = useCallback((message: string) => {
    // Optimistically add user message immediately
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, userMsg])
    chatMutation.mutate(message)
  }, [chatMutation])

  const clearChat = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    sendMessage,
    clearChat,
    isLoading: chatMutation.isPending,
    error: chatMutation.error?.message || null,
  }
}

/* ═══════════════════════════════════════════════════════════════
   usePortfolioUpload — PDF upload + parse
   ═══════════════════════════════════════════════════════════════ */
export function usePortfolioUpload(onSuccess: (data: ParsedPortfolio, filename: string) => void) {
  return useMutation({
    mutationFn: async (file: File) => {
      const base64 = await fileToBase64(file)

      const res = await apiFetch<ParsePortfolioResponse>('/chat/parse-portfolio', {
        method: 'POST',
        body: JSON.stringify({
          fileBase64: base64,
          mimeType: file.type || 'application/pdf',
          filename: file.name,
        }),
      })

      return { data: res.data, filename: file.name }
    },
    onSuccess: (result) => {
      onSuccess(result.data, result.filename)
    },
  })
}

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Strip the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
