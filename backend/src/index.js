import express from 'express'
import cors from 'cors'
import salesRouter from './routes/sales.js'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

// CORS configuration - allow Netlify frontend and localhost for development
app.use(
  cors({
    origin: [
      'https://retailstoresaksham.netlify.app',
      'http://localhost:5173',
      'http://localhost:3000'
    ],
    credentials: true
  })
)

app.use(express.json())

app.use('/api/sales', salesRouter)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
