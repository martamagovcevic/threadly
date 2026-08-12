import { Router } from 'express'
import { add, list, remove } from '../controllers/wishlistController'
import { requireAuth } from '../middleware/auth'

export const wishlistRouter = Router()

wishlistRouter.use(requireAuth)
wishlistRouter.get('/', list)
wishlistRouter.post('/:itemId', add)
wishlistRouter.delete('/:itemId', remove)
