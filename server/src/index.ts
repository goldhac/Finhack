import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { scenariosRouter } from './routes/scenarios.js'
import { chatRouter } from './routes/chat.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  methods: ['GET', 'POST'],
}))
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/scenarios', scenariosRouter)
app.use('/api/chat', chatRouter)

app.listen(PORT, () => {
  console.log(`⚡ ChainPulse API server running on http://localhost:${PORT}`)
  console.log(`   Gemini key: ${process.env.GEMINI_API_KEY ? '✓ loaded' : '✗ MISSING — add to .env'}`)
})

