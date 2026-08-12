import { Router } from 'express'
import { CreateItemSchema, ItemListQuerySchema, UpdateItemSchema } from '@threadly/shared'
import { create, getOne, list, remove, sell, update } from '../controllers/itemController'
import { validateBody, validateQuery } from '../lib/validate'
import { requireAuth } from '../middleware/auth'

export const itemsRouter = Router()

itemsRouter.get('/', validateQuery(ItemListQuerySchema), list)
itemsRouter.get('/:id', getOne)

itemsRouter.post('/', requireAuth, validateBody(CreateItemSchema), create)
itemsRouter.patch('/:id', requireAuth, validateBody(UpdateItemSchema), update)
itemsRouter.post('/:id/sell', requireAuth, sell)
itemsRouter.delete('/:id', requireAuth, remove)
