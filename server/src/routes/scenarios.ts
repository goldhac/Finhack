import { Router, type Request, type Response } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'

const router = Router()

// ── System prompt that transforms Gemini into a macro-financial scenario analyst
const SYSTEM_PROMPT = `You are ChainPulse's Macro-Financial Scenario Analyst — an expert system that simulates the cascading effects of geopolitical, economic, and supply chain events on global systemic stress.

You will receive:
1. A user's natural language scenario (e.g., "Suez Canal blocked for 2 weeks")
2. Current baseline data: GSSI score, stress regime, and 5 stress factor weights

Your job is to simulate the impact of this scenario and return a STRICTLY VALID JSON response with NO markdown, NO code fences, NO explanation text outside the JSON.

Return ONLY this exact JSON structure:
{
  "scenarioTitle": "Short title for the scenario",
  "summary": "2-3 sentence executive summary of the impact",
  "baseline": {
    "gssi": <current GSSI number>,
    "regime": "<current regime>"
  },
  "projected": {
    "gssi": <projected GSSI after scenario, 0-100>,
    "regime": "<projected regime: NOMINAL | ELEVATED | HIGH_ALERT | CRITICAL>",
    "confidence": <0.0-1.0 confidence in projection>,
    "timeHorizon": "<e.g. 2-4 weeks>"
  },
  "factorDeltas": [
    { "factor": "Energy", "baselineWeight": <number>, "projectedWeight": <number>, "delta": <number>, "rationale": "<1 sentence>" },
    { "factor": "Transport", "baselineWeight": <number>, "projectedWeight": <number>, "delta": <number>, "rationale": "<1 sentence>" },
    { "factor": "Trade", "baselineWeight": <number>, "projectedWeight": <number>, "delta": <number>, "rationale": "<1 sentence>" },
    { "factor": "Congestion", "baselineWeight": <number>, "projectedWeight": <number>, "delta": <number>, "rationale": "<1 sentence>" },
    { "factor": "Inventory", "baselineWeight": <number>, "projectedWeight": <number>, "delta": <number>, "rationale": "<1 sentence>" }
  ],
  "sectorImpact": [
    { "sector": "<sector name>", "impact": "POSITIVE | NEGATIVE | NEUTRAL", "magnitude": "LOW | MEDIUM | HIGH", "rationale": "<1 sentence>" }
  ],
  "portfolioActions": [
    { "action": "OVERWEIGHT | UNDERWEIGHT | HEDGE | MONITOR | EXIT", "asset": "<asset or sector>", "urgency": "IMMEDIATE | SHORT_TERM | WATCH", "confidence": <0.0-1.0>, "rationale": "<1 sentence>" }
  ],
  "cascadeNarrative": "<3-5 sentence narrative explaining the chain of causation from the scenario event to market impact>"
}

Rules:
- Be quantitatively precise. Use realistic numbers based on historical analogues.
- Factor weights must sum to 100.
- Include exactly 5 factor deltas (Energy, Transport, Trade, Congestion, Inventory).
- Include 4-6 sector impacts.
- Include 3-5 portfolio actions.
- GSSI projected must reflect the severity of the scenario realistically.
- Return ONLY the JSON object. No other text.`

router.post('/simulate', async (req: Request, res: Response): Promise<void> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      res.status(500).json({
        error: 'GEMINI_API_KEY not configured. Add your key to server/.env'
      })
      return
    }

    const { prompt, currentData } = req.body

    if (!prompt) {
      res.status(400).json({ error: 'prompt is required' })
      return
    }

    // Build context from current dashboard data
    const context = currentData
      ? `Current Baseline Data:
- GSSI: ${currentData.gssi || 72}/100
- Regime: ${currentData.regime || 'ELEVATED'}
- Factor Weights: Energy=${currentData.drivers?.energy || 35}%, Transport=${currentData.drivers?.transport || 20}%, Trade=${currentData.drivers?.trade || 18}%, Congestion=${currentData.drivers?.congestion || 15}%, Inventory=${currentData.drivers?.inventory || 12}%`
      : `Current Baseline Data:
- GSSI: 72/100
- Regime: ELEVATED
- Factor Weights: Energy=35%, Transport=20%, Trade=18%, Congestion=15%, Inventory=12%`

    const userPrompt = `Scenario to simulate: "${prompt}"

${context}

Simulate the impact of this scenario. Return ONLY valid JSON.`

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Retry logic — Gemini occasionally returns malformed JSON
    const MAX_RETRIES = 2
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          systemInstruction: { role: 'system', parts: [{ text: SYSTEM_PROMPT }] },
          generationConfig: {
            temperature: attempt === 0 ? 0.7 : 0.3,
            maxOutputTokens: 16384,
            responseMimeType: 'application/json',
            // @ts-ignore — thinkingConfig is supported by 2.5 models but not yet in SDK types
            thinkingConfig: { thinkingBudget: 2048 },
          },
        })

        const text = result.response.text()

        // Sanitize common JSON issues from LLMs
        const sanitized = text
          .replace(/[\x00-\x1F\x7F]/g, ' ')           // Strip control characters
          .replace(/,\s*([}\]])/g, '$1')               // Remove trailing commas
          .trim()

        let parsed
        // Try sanitized first, then raw
        for (const candidate of [sanitized, text]) {
          try {
            parsed = JSON.parse(candidate)
            break
          } catch {
            // Try to extract JSON object from the response
            const jsonMatch = candidate.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              try {
                parsed = JSON.parse(jsonMatch[0])
                break
              } catch {
                continue
              }
            }
          }
        }

        if (!parsed) {
          throw new Error('Failed to parse Gemini response as valid JSON')
        }

        res.json({ success: true, data: parsed })
        return
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        console.error(`Scenario simulation attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`, lastError.message)
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 1000)) // Brief pause before retry
        }
      }
    }

    // All retries exhausted
    res.status(500).json({ error: `Simulation failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}` })
  } catch (error) {
    console.error('Scenario simulation error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: `Simulation failed: ${message}` })
  }
})

export { router as scenariosRouter }
