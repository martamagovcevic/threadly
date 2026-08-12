import cors from 'cors'
import express from 'express'
import { env } from './config/env'
import { errorHandler, notFoundHandler } from './middleware/error'
import { healthRouter } from './routes/health'

export function createApp() {
  const app = express()

  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }))
  app.use(express.json())

  app.use('/api/health', healthRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
