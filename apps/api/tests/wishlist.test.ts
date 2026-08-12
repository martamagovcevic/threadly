import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app'
import { prisma } from '../src/lib/prisma'
import { createItem, registerUser, resetDb } from './helpers'

const app = createApp()

async function context() {
  const cookie = await registerUser(app, 'wish@test.dev', 'Wish User')
  const user = await prisma.user.findUniqueOrThrow({ where: { email: 'wish@test.dev' } })
  const seller = await prisma.user.create({
    data: { email: 'seller-wish@test.dev', name: 'Seller', password: 'not-used' },
  })
  const item = await createItem(seller.id, { name: 'Wishable jacket' })
  return { cookie, user, item, seller }
}

describe('/api/wishlist', () => {
  beforeEach(resetDb)

  it('requires authentication', async () => {
    expect((await request(app).get('/api/wishlist')).status).toBe(401)
    expect((await request(app).post('/api/wishlist/missing')).status).toBe(401)
  })

  it('adds an available item idempotently and lists it', async () => {
    const { cookie, item } = await context()

    const first = await request(app).post(`/api/wishlist/${item.id}`).set('Cookie', cookie)
    const second = await request(app).post(`/api/wishlist/${item.id}`).set('Cookie', cookie)
    const list = await request(app).get('/api/wishlist').set('Cookie', cookie)

    expect(first.status).toBe(201)
    expect(second.status).toBe(201)
    expect(list.status).toBe(200)
    expect(list.body.items).toHaveLength(1)
    expect(list.body.items[0].id).toBe(item.id)
  })

  it('does not expose unavailable items', async () => {
    const { cookie, seller } = await context()
    const sold = await createItem(seller.id, { sold: true })
    const hidden = await createItem(seller.id, { hidden: true })

    for (const item of [sold, hidden]) {
      const res = await request(app).post(`/api/wishlist/${item.id}`).set('Cookie', cookie)
      expect(res.status).toBe(404)
    }
  })

  it('removes an item and treats repeated removal as success', async () => {
    const { cookie, item, user } = await context()
    await prisma.wishlist.create({ data: { userId: user.id, itemId: item.id } })

    expect(
      (await request(app).delete(`/api/wishlist/${item.id}`).set('Cookie', cookie)).status,
    ).toBe(204)
    expect(
      (await request(app).delete(`/api/wishlist/${item.id}`).set('Cookie', cookie)).status,
    ).toBe(204)
    expect(await prisma.wishlist.count()).toBe(0)
  })

  it('keeps wishlists isolated per user', async () => {
    const { cookie, item } = await context()
    const otherCookie = await registerUser(app, 'other-wish@test.dev')
    await request(app).post(`/api/wishlist/${item.id}`).set('Cookie', cookie)

    const otherList = await request(app).get('/api/wishlist').set('Cookie', otherCookie)
    expect(otherList.body.items).toEqual([])
  })
})
