import { Router } from 'express'
import { CreateItemSchema, ItemListQuerySchema, UpdateItemSchema } from '@threadly/shared'
import {
  create,
  getOne,
  list,
  mine,
  remove,
  sell,
  setImage,
  update,
} from '../controllers/itemController'
import { validateBody, validateQuery } from '../lib/validate'
import { uploadImage } from '../lib/upload'
import { requireAuth } from '../middleware/auth'
import { requireItemOwner } from '../middleware/ownership'

export const itemsRouter = Router()

itemsRouter.get('/', validateQuery(ItemListQuerySchema), list)
itemsRouter.get('/mine', requireAuth, mine)
itemsRouter.get('/:id', getOne)

itemsRouter.post('/', requireAuth, validateBody(CreateItemSchema), create)
itemsRouter.patch('/:id', requireAuth, validateBody(UpdateItemSchema), update)
itemsRouter.post('/:id/sell', requireAuth, sell)
itemsRouter.post('/:id/image', requireAuth, requireItemOwner, uploadImage.single('image'), setImage)
itemsRouter.delete('/:id', requireAuth, remove)
