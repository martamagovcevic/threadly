import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { LoginSchema, RegisterSchema } from '@threadly/shared'
import { login, logout, me, register } from '../controllers/authController'
import { validateBody } from '../lib/validate'
import { requireAuth } from '../middleware/auth'

export const authRouter = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
})

authRouter.use(authLimiter)

authRouter.post('/register', validateBody(RegisterSchema), register)
authRouter.post('/login', validateBody(LoginSchema), login)
authRouter.post('/logout', logout)
authRouter.get('/me', requireAuth, me)
