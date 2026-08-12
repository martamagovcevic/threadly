import type { Request, Response } from 'express'
import type { ItemListQuery } from '@threadly/shared'
import { toPublicItem } from '../lib/itemSerializer'
import { getItemById, listItems } from '../services/itemService'

export async function list(req: Request, res: Response) {
  const result = await listItems(res.locals.validatedQuery as ItemListQuery)
  res.json(result)
}

export async function getOne(req: Request, res: Response) {
  const item = await getItemById(req.params.id as string)

  if (!item) {
    res.status(404).json({ error: { code: 'ITEM_NOT_FOUND', message: 'Item not found' } })
    return
  }

  res.json({ item: toPublicItem(item) })
}
