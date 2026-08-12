import { prisma } from '../lib/prisma'

const sellerSelect = { id: true, name: true } as const

export async function listWishlist(userId: string) {
  const entries = await prisma.wishlist.findMany({
    where: { userId, item: { sold: false, hidden: false } },
    orderBy: { item: { createdAt: 'desc' } },
    include: { item: { include: { seller: { select: sellerSelect } } } },
  })
  return entries.map((entry) => entry.item)
}

export async function addToWishlist(userId: string, itemId: string) {
  const item = await prisma.item.findFirst({
    where: { id: itemId, sold: false, hidden: false },
    include: { seller: { select: sellerSelect } },
  })
  if (!item) return null

  await prisma.wishlist.upsert({
    where: { userId_itemId: { userId, itemId } },
    create: { userId, itemId },
    update: {},
  })
  return item
}

export async function removeFromWishlist(userId: string, itemId: string) {
  const result = await prisma.wishlist.deleteMany({ where: { userId, itemId } })
  return result.count > 0
}
