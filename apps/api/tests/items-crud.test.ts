import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app'
import { createItem, createUser, registerUser, resetDb, sessionCookie } from './helpers'
import { prisma } from '../src/lib/prisma'

const app = createApp()

const validItem = {
  name: 'New Denim Jacket',
  description: 'A classic trucker jacket',
  price: 60,
  condition: 'GOOD',
  category: 'DENIM',
}

async function userIdByEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  return user?.id
}

describe('POST /api/items', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('requires authentication', async () => {
    const res = await request(app).post('/api/items').send(validItem)

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
  })

  it('creates an item owned by the authenticated user', async () => {
    const cookie = await registerUser(app, 'owner@test.dev')

    const res = await request(app).post('/api/items').set('Cookie', cookie).send(validItem)

    expect(res.status).toBe(201)
    expect(res.body.item.name).toBe('New Denim Jacket')
    expect(res.body.item.price).toBe(60)
    expect(res.body.item.sold).toBe(false)
    expect(res.body.item.seller.name).toBe('Test User')
  })

  it('rejects an invalid body with 400', async () => {
    const cookie = await registerUser(app, 'owner@test.dev')

    const res = await request(app)
      .post('/api/items')
      .set('Cookie', cookie)
      .send({ name: '', description: '', price: -5, condition: 'NOPE', category: 'DENIM' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })
})

describe('PATCH /api/items/:id', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('lets the owner update their item', async () => {
    const cookie = await registerUser(app, 'owner@test.dev')
    const owner = await prisma.user.findUniqueOrThrow({ where: { email: 'owner@test.dev' } })
    const item = await createItem(owner.id, { name: 'Original' })

    const res = await request(app)
      .patch(`/api/items/${item.id}`)
      .set('Cookie', cookie)
      .send({ name: 'Updated Name', price: 99 })

    expect(res.status).toBe(200)
    expect(res.body.item.name).toBe('Updated Name')
    expect(res.body.item.price).toBe(99)
  })

  it('forbids non-owners from updating', async () => {
    const owner = await createUser('owner@test.dev')
    const item = await createItem(owner.id, { name: 'Original' })
    const cookie = await registerUser(app, 'intruder@test.dev')

    const res = await request(app)
      .patch(`/api/items/${item.id}`)
      .set('Cookie', cookie)
      .send({ name: 'Hacked' })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN')
  })

  it('returns 404 for an unknown item', async () => {
    const cookie = await registerUser(app, 'owner@test.dev')

    const res = await request(app)
      .patch('/api/items/nope')
      .set('Cookie', cookie)
      .send({ name: 'X' })

    expect(res.status).toBe(404)
  })
})

describe('POST /api/items/:id/sell', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('lets the owner mark their item as sold', async () => {
    const cookie = await registerUser(app, 'owner@test.dev')
    const owner = await prisma.user.findUniqueOrThrow({ where: { email: 'owner@test.dev' } })
    const item = await createItem(owner.id)

    const res = await request(app).post(`/api/items/${item.id}/sell`).set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.item.sold).toBe(true)

    const listing = await request(app).get('/api/items')
    expect(listing.body.items.find((i: { id: string }) => i.id === item.id)).toBeUndefined()
  })

  it('forbids non-owners from selling', async () => {
    const owner = await createUser('owner@test.dev')
    const item = await createItem(owner.id)
    const cookie = await registerUser(app, 'intruder@test.dev')

    const res = await request(app).post(`/api/items/${item.id}/sell`).set('Cookie', cookie)

    expect(res.status).toBe(403)
  })
})

describe('DELETE /api/items/:id', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('lets the owner delete their item', async () => {
    const cookie = await registerUser(app, 'owner@test.dev')
    const owner = await prisma.user.findUniqueOrThrow({ where: { email: 'owner@test.dev' } })
    const item = await createItem(owner.id)

    const res = await request(app).delete(`/api/items/${item.id}`).set('Cookie', cookie)

    expect(res.status).toBe(204)

    const gone = await request(app).get(`/api/items/${item.id}`)
    expect(gone.status).toBe(404)
  })

  it('forbids non-owners from deleting', async () => {
    const owner = await createUser('owner@test.dev')
    const item = await createItem(owner.id)
    const cookie = await registerUser(app, 'intruder@test.dev')

    const res = await request(app).delete(`/api/items/${item.id}`).set('Cookie', cookie)

    expect(res.status).toBe(403)
  })
})

describe('auth reuse check', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('sessionCookie still reads set-cookie headers', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@test.dev', name: 'A', password: 'password123' })

    expect(sessionCookie(res).join('')).toContain('threadly.sid')
    expect(await userIdByEmail('a@test.dev')).toBeTruthy()
  })
})

describe('GET /api/items/mine', () => {
  beforeEach(resetDb)

  it('returns all of the current seller listings, including sold items', async () => {
    const cookie = await registerUser(app, 'my-listings@test.dev')
    const owner = await prisma.user.findUniqueOrThrow({ where: { email: 'my-listings@test.dev' } })
    await createItem(owner.id, { name: 'Live piece' })
    await createItem(owner.id, { name: 'Sold piece', sold: true })
    const other = await createUser('other-listings@test.dev')
    await createItem(other.id, { name: 'Not mine' })

    const response = await request(app).get('/api/items/mine').set('Cookie', cookie)
    expect(response.status).toBe(200)
    expect(response.body.items.map((item: { name: string }) => item.name).sort()).toEqual([
      'Live piece',
      'Sold piece',
    ])
  })
})
