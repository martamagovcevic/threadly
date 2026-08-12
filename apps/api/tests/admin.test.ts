import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app'
import { prisma } from '../src/lib/prisma'
import { createItem, createUser, registerUser, resetDb, sessionCookie } from './helpers'

const app = createApp()

async function adminCookie() {
  await createUser('admin@test.dev', 'ADMIN', 'Admin')
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.dev', password: 'password123' })
  return sessionCookie(response)
}

describe('/api/admin', () => {
  beforeEach(resetDb)

  it('rejects guests and regular users', async () => {
    expect((await request(app).get('/api/admin/items')).status).toBe(401)
    const cookie = await registerUser(app, 'ordinary@test.dev')
    expect((await request(app).get('/api/admin/items').set('Cookie', cookie)).status).toBe(403)
  })

  it('lists visible, hidden, and sold listings for moderation', async () => {
    const cookie = await adminCookie()
    const seller = await createUser('moderated-seller@test.dev')
    await createItem(seller.id)
    await createItem(seller.id, { hidden: true })
    await createItem(seller.id, { sold: true })

    const response = await request(app).get('/api/admin/items').set('Cookie', cookie)
    expect(response.status).toBe(200)
    expect(response.body.items).toHaveLength(3)
    expect(response.body.items.some((item: { hidden: boolean }) => item.hidden)).toBe(true)
  })

  it('hides and restores a listing', async () => {
    const cookie = await adminCookie()
    const seller = await createUser('toggle-seller@test.dev')
    const item = await createItem(seller.id)

    const hidden = await request(app)
      .patch(`/api/admin/items/${item.id}`)
      .set('Cookie', cookie)
      .send({ hidden: true })
    expect(hidden.status).toBe(200)
    expect(hidden.body.item.hidden).toBe(true)
    expect((await request(app).get(`/api/items/${item.id}`)).status).toBe(404)

    const restored = await request(app)
      .patch(`/api/admin/items/${item.id}`)
      .set('Cookie', cookie)
      .send({ hidden: false })
    expect(restored.body.item.hidden).toBe(false)
  })

  it('shows all orders with buyer context', async () => {
    const cookie = await adminCookie()
    const buyer = await createUser('admin-buyer@test.dev')
    const seller = await createUser('admin-seller@test.dev')
    const item = await createItem(seller.id, { sold: true })
    await prisma.order.create({ data: { buyerId: buyer.id, itemId: item.id, pricePaid: 42 } })

    const response = await request(app).get('/api/admin/orders').set('Cookie', cookie)
    expect(response.status).toBe(200)
    expect(response.body.orders[0].buyer.email).toBe('admin-buyer@test.dev')
    expect(response.body.orders[0].pricePaid).toBe(42)
  })
})
