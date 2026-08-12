import { Router } from 'express'
import { ModerateItemSchema } from '@threadly/shared'
import { items, moderate, orders } from '../controllers/adminController'
import { validateBody } from '../lib/validate'
import { requireAdmin } from '../middleware/auth'

export const adminRouter = Router()
adminRouter.use(requireAdmin)
adminRouter.get('/items', items)
adminRouter.patch('/items/:id', validateBody(ModerateItemSchema), moderate)
adminRouter.get('/orders', orders)
