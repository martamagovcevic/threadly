import type { Item, Role } from '@prisma/client'
import type { Express } from 'express'
import request from 'supertest'
import { prisma } from '../src/lib/prisma'
import { hashPassword } from '../src/lib/password'

export async function resetDb() {
  await prisma.$transaction([
    prisma.order.deleteMany(),
    prisma.wishlist.deleteMany(),
    prisma.item.deleteMany(),
    prisma.session.deleteMany(),
    prisma.user.deleteMany(),
  ])
}

export function sessionCookie(res: request.Response): string[] {
  const value = res.headers['set-cookie']
  return Array.isArray(value) ? value : value ? [value] : []
}

export async function registerUser(
  app: Express,
  email: string,
  name = 'Test User',
  password = 'password123',
) {
  const res = await request(app).post('/api/auth/register').send({ email, name, password })
  return sessionCookie(res)
}

export async function createUser(email: string, role: Role = 'USER', name = 'Test User') {
  return prisma.user.create({
    data: { email, name, password: await hashPassword('password123'), role },
  })
}

export async function createItem(sellerId: string, overrides: Partial<Item> = {}) {
  return prisma.item.create({
    data: {
      name: 'Test Item',
      description: 'A test item for the catalog',
      price: 10,
      condition: 'GOOD',
      category: 'OTHER',
      sellerId,
      ...overrides,
    },
  })
}

export async function createTestCatalog() {
  const seller = await createUser('catalog-seller@test.dev')
  const [denim, dress, jacket] = await Promise.all([
    createItem(seller.id, {
      name: 'Vintage Jeans',
      description: 'Broken in denim',
      price: 50,
      condition: 'GOOD',
      category: 'DENIM',
    }),
    createItem(seller.id, {
      name: 'Floral Dress',
      description: 'Sweet summer dress',
      price: 25,
      condition: 'NEW',
      category: 'DRESSES',
    }),
    createItem(seller.id, {
      name: 'Leather Jacket',
      description: 'Classic biker',
      price: 150,
      condition: 'GOOD',
      category: 'OUTERWEAR',
    }),
  ])
  await createItem(seller.id, {
    name: 'Sold Out Coat',
    description: 'No longer available',
    price: 80,
    hidden: true,
    sold: true,
  })
  await createItem(seller.id, {
    name: 'Hidden Top',
    description: 'Under review',
    price: 30,
    hidden: true,
  })
  return { seller, denim, dress, jacket }
}
