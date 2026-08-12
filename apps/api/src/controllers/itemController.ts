import type { Request, Response } from 'express'
import type { CreateItemInput, ItemListQuery, UpdateItemInput } from '@threadly/shared'
import { toPublicItem } from '../lib/itemSerializer'
import {
  createItem,
  deleteItem,
  getItemById,
  getItemWithSeller,
  listItems,
  markItemSold,
  updateItem,
} from '../services/itemService'
import { itemNotFound, forbidden } from './itemErrors'

export async function list(req: Request, res: Response) {
  const result = await listItems(res.locals.validatedQuery as ItemListQuery)
  res.json(result)
}

export async function getOne(req: Request, res: Response) {
  const item = await getItemById(req.params.id as string)

  if (!item) {
    itemNotFound(res)
    return
  }

  res.json({ item: toPublicItem(item) })
}

export async function create(req: Request, res: Response) {
  const item = await createItem(req.body as CreateItemInput, res.locals.user.id)
  res.status(201).json({ item: toPublicItem(item) })
}

export async function update(req: Request, res: Response) {
  const existing = await getItemWithSeller(req.params.id as string)

  if (!existing) {
    itemNotFound(res)
    return
  }
  if (existing.sellerId !== res.locals.user.id) {
    forbidden(res, 'You can only edit your own items')
    return
  }

  const item = await updateItem(existing.id, req.body as UpdateItemInput)
  res.json({ item: toPublicItem(item) })
}

export async function sell(req: Request, res: Response) {
  const existing = await getItemWithSeller(req.params.id as string)

  if (!existing) {
    itemNotFound(res)
    return
  }
  if (existing.sellerId !== res.locals.user.id) {
    forbidden(res, 'You can only sell your own items')
    return
  }

  const item = await markItemSold(existing.id)
  res.json({ item: toPublicItem(item) })
}

export async function remove(req: Request, res: Response) {
  const existing = await getItemWithSeller(req.params.id as string)

  if (!existing) {
    itemNotFound(res)
    return
  }
  if (existing.sellerId !== res.locals.user.id) {
    forbidden(res, 'You can only delete your own items')
    return
  }

  await deleteItem(existing.id)
  res.status(204).end()
}
