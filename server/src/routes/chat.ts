import { Router } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const chatRouter = Router()

/* ═══════════════════════════════════════════════════════════════
   SYSTEM PROMPT — Senior ChainPulse Analyst persona
   ═══════════════════════════════════════════════════════════════ */
const ANALYST_SYSTEM_PROMPT = `You are **CISCO**, a senior macro-financial strategist embedded inside ChainPulse — a supply chain stress intelligence platform.

## Your Capabilities
- You have FULL read access to every data surface in ChainPulse: GSSI scores, stress regimes, driver decompositions, forecasts, market implications, portfolio allocations, sector impacts, equity exposures, action protocols, and intelligence feeds.
- When the user has uploaded their personal portfolio, you can cross-reference their actual holdings against ChainPulse stress data.

## Response Rules
1. **Cite specific metrics inline** using this exact format: [SOURCE → METRIC: VALUE]. Examples:
   - [Dashboard → GSSI: 72]
   - [Drivers → Energy Contribution: 35%]
   - [Portfolio → XOM Correlation: 76.8%]
   - [Forecast → 3-Month Projection: 80]
2. **Be direct and actionable.** You are advising institutional-grade investors. No fluff. Lead with the answer, then support with data.
3. **Cross-reference across data surfaces.** If the user asks about energy, pull data from Dashboard drivers, Portfolio allocations, Sector impacts, AND equity exposures — don't silo your answer.
4. **Quantify everything.** Use exact numbers, percentages, and confidence scores from the data provided.
5. **Format responses with clear structure.** Use headers (##), bullet points, and bold text for readability. Keep paragraphs short.
6. **If the user uploaded a personal portfolio**, analyze it in context of the ChainPulse data. Identify risk concentrations, stress exposures, and actionable recommendations.
7. **Never invent data.** Only cite numbers from the provided context. If you don't have data to answer, say so explicitly.
8. **Respond in a professional but accessible tone.** Think Bloomberg Terminal meets a human strategist.`

/* ═══════════════════════════════════════════════════════════════
   POST /api/chat/message — Multi-turn analyst chat
   ═══════════════════════════════════════════════════════════════ */
chatRouter.post('/message', async (req, res) => {
  try {
    const { message, history, dashboardContext, portfolioContext, userPortfolio } = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' })
    }

    // Build data context string with all available data surfaces
    const dataContext = buildDataContext(dashboardContext, portfolioContext, userPortfolio)

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Build conversation history for multi-turn
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = []

    // Inject data context as the first user message
    contents.push({
      role: 'user',
      parts: [{ text: `Here is the complete ChainPulse data context you have access to:\n\n${dataContext}\n\n---\nAcknowledge that you have received the data context and are ready to answer questions.` }]
    })
    contents.push({
      role: 'model',
      parts: [{ text: 'Data context loaded. I have full visibility into GSSI metrics, driver decomposition, forecasts, market implications, portfolio allocations, sector impacts, equity exposures, action protocols, and intelligence feeds. Ready for analysis.' }]
    })

    // Add conversation history
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })
      }
    }

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    })

    const MAX_RETRIES = 2
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await model.generateContent({
          contents,
          systemInstruction: { role: 'system', parts: [{ text: ANALYST_SYSTEM_PROMPT }] },
          generationConfig: {
            temperature: attempt === 0 ? 0.7 : 0.4,
            maxOutputTokens: 8192,
            // @ts-ignore
            thinkingConfig: { thinkingBudget: 2048 },
          },
        })

        const text = result.response.text()

        // Extract citations from the response
        const citations = extractCitations(text)

        res.json({
          success: true,
          data: {
            content: text,
            citations,
            timestamp: Date.now(),
          }
        })
        return
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        console.error(`Chat attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`, lastError.message)
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }

    res.status(500).json({ error: `Chat failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}` })
  } catch (error) {
    console.error('Chat error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: `Chat failed: ${message}` })
  }
})

/* ═══════════════════════════════════════════════════════════════
   POST /api/chat/parse-portfolio — PDF portfolio extraction
   ═══════════════════════════════════════════════════════════════ */
chatRouter.post('/parse-portfolio', async (req, res) => {
  try {
    const { fileBase64, mimeType, filename } = req.body

    if (!fileBase64) {
      return res.status(400).json({ error: 'fileBase64 is required' })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const PARSE_PROMPT = `Analyze this portfolio document and extract all holdings into structured JSON.

Return ONLY valid JSON in this exact format:
{
  "holdings": [
    {
      "ticker": "AAPL",
      "name": "Apple Inc",
      "shares": 150,
      "value": 25350.00,
      "sector": "Technology",
      "weight": 12.5
    }
  ],
  "summary": {
    "totalValue": 202800.00,
    "totalHoldings": 15,
    "sectorBreakdown": {
      "Technology": 35.2,
      "Healthcare": 18.1,
      "Energy": 15.4,
      "Financials": 12.8,
      "Other": 18.5
    },
    "topHoldings": ["AAPL", "MSFT", "JNJ"],
    "riskNotes": "High concentration in Technology sector. Limited international exposure."
  }
}

Rules:
- Extract EVERY holding mentioned in the document
- If share count is unknown, estimate from dollar value
- If value is unknown, leave as 0
- Assign sectors based on standard GICS classification
- Weight = (holding value / total portfolio value) * 100
- Include a brief risk assessment in riskNotes`

    const MAX_RETRIES = 2
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await model.generateContent({
          contents: [{
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'application/pdf',
                  data: fileBase64,
                }
              },
              { text: PARSE_PROMPT }
            ]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
            // @ts-ignore
            thinkingConfig: { thinkingBudget: 2048 },
          },
        })

        const text = result.response.text()

        // Parse JSON
        const sanitized = text
          .replace(/[\x00-\x1F\x7F]/g, ' ')
          .replace(/,\s*([}\]])/g, '$1')
          .trim()

        let parsed
        try {
          parsed = JSON.parse(sanitized)
        } catch {
          const jsonMatch = sanitized.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0])
          } else {
            throw new Error('Failed to parse portfolio extraction result')
          }
        }

        res.json({ success: true, data: parsed })
        return
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        console.error(`Portfolio parse attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`, lastError.message)
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }

    res.status(500).json({ error: `Portfolio parsing failed: ${lastError?.message}` })
  } catch (error) {
    console.error('Portfolio parse error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: `Portfolio parsing failed: ${message}` })
  }
})

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

function buildDataContext(
  dashboard: Record<string, unknown> | undefined,
  portfolio: Record<string, unknown> | undefined,
  userPortfolio: Record<string, unknown> | undefined
): string {
  const sections: string[] = []

  if (dashboard) {
    sections.push(`## DASHBOARD DATA
${JSON.stringify(dashboard, null, 2)}`)
  }

  if (portfolio) {
    sections.push(`## PORTFOLIO STRATEGY DATA
${JSON.stringify(portfolio, null, 2)}`)
  }

  if (userPortfolio) {
    sections.push(`## USER'S PERSONAL UPLOADED PORTFOLIO
This is the user's actual portfolio that they uploaded. Cross-reference these holdings against the ChainPulse stress data above.
${JSON.stringify(userPortfolio, null, 2)}`)
  }

  return sections.length > 0
    ? sections.join('\n\n---\n\n')
    : 'No data context available. Answer based on general macro-financial knowledge.'
}

function extractCitations(text: string): Array<{ metric: string; value: string; source: string }> {
  const citations: Array<{ metric: string; value: string; source: string }> = []
  const pattern = /\[(\w+(?:\s+\w+)*)\s*→\s*([^:]+):\s*([^\]]+)\]/g
  let match

  while ((match = pattern.exec(text)) !== null) {
    citations.push({
      source: match[1].trim(),
      metric: match[2].trim(),
      value: match[3].trim(),
    })
  }

  return citations
}
