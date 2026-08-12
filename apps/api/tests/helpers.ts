import { prisma } from '../src/lib/prisma'

export async function resetDb() {
  await prisma.$transaction([
    prisma.order.deleteMany(),
    prisma.wishlist.deleteMany(),
    prisma.item.deleteMany(),
    prisma.session.deleteMany(),
    prisma.user.deleteMany(),
  ])
}
