import { Router } from 'express'
import { ItemListQuerySchema } from '@threadly/shared'
import { getOne, list } from '../controllers/itemController'
import { validateQuery } from '../lib/validate'

export const itemsRouter = Router()

itemsRouter.get('/', validateQuery(ItemListQuerySchema), list)
itemsRouter.get('/:id', getOne)
