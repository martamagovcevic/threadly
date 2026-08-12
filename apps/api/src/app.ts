import cors from 'cors'
import express from 'express'
import { env } from './config/env'
import { createSessionMiddleware } from './lib/session'
import { errorHandler, notFoundHandler } from './middleware/error'
import { authRouter } from './routes/auth'
import { healthRouter } from './routes/health'
import { itemsRouter } from './routes/items'

export function createApp() {
  const app = express()

  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }))
  app.use(express.json())
  app.use(createSessionMiddleware())

  app.use('/api/health', healthRouter)
  app.use('/api/auth', authRouter)
  app.use('/api/items', itemsRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
