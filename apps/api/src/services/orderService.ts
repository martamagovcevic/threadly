import { prisma } from '../lib/prisma'

const itemInclude = { seller: { select: { id: true, name: true } } } as const

export class CheckoutError extends Error {
  constructor(
    public readonly code: 'ITEM_NOT_FOUND' | 'OWN_ITEM' | 'ITEM_UNAVAILABLE',
    message: string,
  ) {
    super(message)
  }
}

export async function checkout(buyerId: string, itemId: string) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({ where: { id: itemId } })
    if (!item) throw new CheckoutError('ITEM_NOT_FOUND', 'Item not found')
    if (item.sellerId === buyerId)
      throw new CheckoutError('OWN_ITEM', 'You cannot purchase your own item')
    if (item.sold || item.hidden)
      throw new CheckoutError('ITEM_UNAVAILABLE', 'This item is no longer available')

    const claimed = await tx.item.updateMany({
      where: { id: itemId, sold: false, hidden: false },
      data: { sold: true },
    })
    if (claimed.count !== 1)
      throw new CheckoutError('ITEM_UNAVAILABLE', 'This item is no longer available')

    await tx.wishlist.deleteMany({ where: { itemId } })
    return tx.order.create({
      data: { buyerId, itemId, pricePaid: item.price },
      include: { item: { include: itemInclude } },
    })
  })
}

export function listOrders(buyerId: string) {
  return prisma.order.findMany({
    where: { buyerId },
    orderBy: { createdAt: 'desc' },
    include: { item: { include: itemInclude } },
  })
}
