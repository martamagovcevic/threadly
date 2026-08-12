import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app'
import { prisma } from '../src/lib/prisma'
import { createItem, registerUser, resetDb } from './helpers'

const app = createApp()

async function context() {
  const buyerCookie = await registerUser(app, 'buyer@test.dev', 'Buyer')
  const buyer = await prisma.user.findUniqueOrThrow({ where: { email: 'buyer@test.dev' } })
  const sellerCookie = await registerUser(app, 'seller-order@test.dev', 'Seller')
  const seller = await prisma.user.findUniqueOrThrow({ where: { email: 'seller-order@test.dev' } })
  const item = await createItem(seller.id, { name: 'Checkout coat', price: 88 })
  return { buyerCookie, buyer, sellerCookie, seller, item }
}

describe('/api/orders', () => {
  beforeEach(resetDb)

  it('requires authentication', async () => {
    expect((await request(app).get('/api/orders')).status).toBe(401)
    expect((await request(app).post('/api/orders').send({ itemId: 'x' })).status).toBe(401)
  })

  it('purchases an available item at its current price', async () => {
    const { buyerCookie, buyer, item } = await context()
    await prisma.wishlist.create({ data: { userId: buyer.id, itemId: item.id } })

    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', buyerCookie)
      .send({ itemId: item.id })
    expect(res.status).toBe(201)
    expect(res.body.order.pricePaid).toBe(88)
    expect(res.body.order.item.sold).toBe(true)
    expect((await prisma.item.findUniqueOrThrow({ where: { id: item.id } })).sold).toBe(true)
    expect(await prisma.wishlist.count({ where: { itemId: item.id } })).toBe(0)
  })

  it('prevents self-purchases', async () => {
    const { sellerCookie, item } = await context()
    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', sellerCookie)
      .send({ itemId: item.id })
    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('OWN_ITEM')
  })

  it('prevents duplicate purchases', async () => {
    const { buyerCookie, item } = await context()
    expect(
      (await request(app).post('/api/orders').set('Cookie', buyerCookie).send({ itemId: item.id }))
        .status,
    ).toBe(201)
    const duplicate = await request(app)
      .post('/api/orders')
      .set('Cookie', buyerCookie)
      .send({ itemId: item.id })
    expect(duplicate.status).toBe(409)
    expect(duplicate.body.error.code).toBe('ITEM_UNAVAILABLE')
    expect(await prisma.order.count({ where: { itemId: item.id } })).toBe(1)
  })

  it('lists only the signed-in buyer orders', async () => {
    const { buyerCookie, item } = await context()
    await request(app).post('/api/orders').set('Cookie', buyerCookie).send({ itemId: item.id })
    const otherCookie = await registerUser(app, 'other-buyer@test.dev')

    const own = await request(app).get('/api/orders').set('Cookie', buyerCookie)
    const other = await request(app).get('/api/orders').set('Cookie', otherCookie)
    expect(own.body.orders).toHaveLength(1)
    expect(own.body.orders[0].item.name).toBe('Checkout coat')
    expect(other.body.orders).toEqual([])
  })
})
