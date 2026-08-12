import type { NextFunction, Request, Response } from 'express'
import { forbidden, itemNotFound } from '../controllers/itemErrors'
import { getItemWithSeller } from '../services/itemService'

export async function requireItemOwner(req: Request, res: Response, next: NextFunction) {
  const item = await getItemWithSeller(req.params.id as string)

  if (!item) {
    itemNotFound(res)
    return
  }
  if (item.sellerId !== res.locals.user.id) {
    forbidden(res, 'You can only modify your own items')
    return
  }

  res.locals.item = item
  next()
}
