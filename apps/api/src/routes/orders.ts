import { Router } from 'express'
import { CheckoutSchema } from '@threadly/shared'
import { create, list } from '../controllers/orderController'
import { validateBody } from '../lib/validate'
import { requireAuth } from '../middleware/auth'

export const ordersRouter = Router()
ordersRouter.use(requireAuth)
ordersRouter.get('/', list)
ordersRouter.post('/', validateBody(CheckoutSchema), create)
