import type { Request, Response } from 'express'
import type { ModerateItemInput } from '@threadly/shared'
import { toPublicItem } from '../lib/itemSerializer'
import { findItem, listAllItems, listAllOrders, moderateItem } from '../services/adminService'

function adminItem(item: Parameters<typeof toPublicItem>[0] & { hidden: boolean }) {
  return { ...toPublicItem(item), hidden: item.hidden }
}

export async function items(_req: Request, res: Response) {
  res.json({ items: (await listAllItems()).map(adminItem) })
}

export async function moderate(req: Request, res: Response) {
  const id = req.params.id as string
  const existing = await findItem(id)
  if (!existing) {
    res.status(404).json({ error: { code: 'ITEM_NOT_FOUND', message: 'Item not found' } })
    return
  }
  const item = await moderateItem(id, (req.body as ModerateItemInput).hidden)
  res.json({ item: adminItem(item) })
}

export async function orders(_req: Request, res: Response) {
  const all = await listAllOrders()
  res.json({
    orders: all.map((order) => ({
      id: order.id,
      pricePaid: order.pricePaid,
      createdAt: order.createdAt.toISOString(),
      buyer: order.buyer,
      item: adminItem(order.item),
    })),
  })
}
