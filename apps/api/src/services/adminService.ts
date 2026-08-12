import { prisma } from '../lib/prisma'

const seller = { select: { id: true, name: true } } as const

export function listAllItems() {
  return prisma.item.findMany({ orderBy: { createdAt: 'desc' }, include: { seller } })
}

export function findItem(id: string) {
  return prisma.item.findUnique({ where: { id } })
}

export function moderateItem(id: string, hidden: boolean) {
  return prisma.item.update({ where: { id }, data: { hidden }, include: { seller } })
}

export function listAllOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      buyer: { select: { id: true, name: true, email: true } },
      item: { include: { seller } },
    },
  })
}
