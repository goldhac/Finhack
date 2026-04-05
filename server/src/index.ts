import 'dotenv/config'
import path from 'path'
import fs from 'fs'
import express from 'express'
import cors from 'cors'
import { scenariosRouter } from './routes/scenarios.js'
import { chatRouter } from './routes/chat.js'
import { createGssiRouter } from './routes/gssi.js'

const app = express()
const PORT = process.env.PORT || 3001

const OUTPUT_DIR = process.env.OUTPUT_DIR
  ? path.resolve(process.env.OUTPUT_DIR)
  : path.resolve(path.join(process.cwd(), '..', 'output'))

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
app.use('/api/gssi', createGssiRouter(OUTPUT_DIR))

// Serve frontend static files (Production/Docker deployment)
const clientDistPath = path.resolve(path.join(process.cwd(), '..', 'client', 'dist'))
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath))
  
  // Catch-all route to serve React's index.html for frontend routing
  // Using app.use() instead of app.get('*') to be compatible with Express v5 path routing
  app.use((req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(clientDistPath, 'index.html'))
    } else {
      res.status(404).json({ error: 'API endpoint not found' })
    }
  })
}

app.listen(PORT, () => {
  console.log(`⚡ ChainPulse API server running on http://localhost:${PORT}`)
  console.log(`   Gemini key: ${process.env.GEMINI_API_KEY ? '✓ loaded' : '✗ MISSING — add to .env'}`)
  console.log(`📂 Output directory: ${OUTPUT_DIR}`)
  console.log(`   Output exists: ${fs.existsSync(OUTPUT_DIR) ? '✓' : '✗ NOT FOUND — run gssi_pipeline.py first'}`)
})
