import type { Request, Response } from 'express'
import { toPublicItem } from '../lib/itemSerializer'
import { addToWishlist, listWishlist, removeFromWishlist } from '../services/wishlistService'
import { itemNotFound } from './itemErrors'

export async function list(_req: Request, res: Response) {
  const items = await listWishlist(res.locals.user.id)
  res.json({ items: items.map(toPublicItem) })
}

export async function add(req: Request, res: Response) {
  const item = await addToWishlist(res.locals.user.id, req.params.itemId as string)
  if (!item) {
    itemNotFound(res)
    return
  }
  res.status(201).json({ item: toPublicItem(item) })
}

export async function remove(req: Request, res: Response) {
  await removeFromWishlist(res.locals.user.id, req.params.itemId as string)
  res.status(204).end()
}
