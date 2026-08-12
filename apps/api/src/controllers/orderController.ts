import type { Request, Response } from 'express'
import type { CheckoutInput } from '@threadly/shared'
import { toPublicItem } from '../lib/itemSerializer'
import { CheckoutError, checkout, listOrders } from '../services/orderService'

function serialize(order: Awaited<ReturnType<typeof checkout>>) {
  return {
    id: order.id,
    pricePaid: order.pricePaid,
    createdAt: order.createdAt.toISOString(),
    item: toPublicItem(order.item),
  }
}

export async function create(req: Request, res: Response) {
  try {
    const order = await checkout(res.locals.user.id, (req.body as CheckoutInput).itemId)
    res.status(201).json({ order: serialize(order) })
  } catch (error) {
    if (error instanceof CheckoutError) {
      const status = error.code === 'ITEM_NOT_FOUND' ? 404 : 409
      res.status(status).json({ error: { code: error.code, message: error.message } })
      return
    }
    throw error
  }
}

export async function list(_req: Request, res: Response) {
  const orders = await listOrders(res.locals.user.id)
  res.json({ orders: orders.map(serialize) })
}
