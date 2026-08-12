import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app'
import { createItem, registerUser, resetDb } from './helpers'
import { prisma } from '../src/lib/prisma'

const app = createApp()

const PNG_1x1 = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6360010000050001d5c5f72b0000000049454e44ae426082',
  'hex',
)

async function ownerContext() {
  const cookie = await registerUser(app, 'owner-img@test.dev')
  const owner = await prisma.user.findUniqueOrThrow({ where: { email: 'owner-img@test.dev' } })
  const item = await createItem(owner.id)
  return { cookie, item }
}

describe('POST /api/items/:id/image', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('requires authentication', async () => {
    const { item } = await ownerContext()

    const res = await request(app)
      .post(`/api/items/${item.id}/image`)
      .attach('image', PNG_1x1, { filename: 'photo.png', contentType: 'image/png' })

    expect(res.status).toBe(401)
  })

  it('forbids non-owners before persisting anything', async () => {
    const { item } = await ownerContext()
    const intruderCookie = await registerUser(app, 'intruder-img@test.dev')

    const res = await request(app)
      .post(`/api/items/${item.id}/image`)
      .set('Cookie', intruderCookie)
      .attach('image', PNG_1x1, { filename: 'photo.png', contentType: 'image/png' })

    expect(res.status).toBe(403)
    const fresh = await prisma.item.findUniqueOrThrow({ where: { id: item.id } })
    expect(fresh.imageUrl).toBeNull()
  })

  it('lets the owner upload an image and serves it back', async () => {
    const { cookie, item } = await ownerContext()

    const res = await request(app)
      .post(`/api/items/${item.id}/image`)
      .set('Cookie', cookie)
      .attach('image', PNG_1x1, { filename: 'photo.png', contentType: 'image/png' })

    expect(res.status).toBe(200)
    expect(res.body.item.imageUrl).toMatch(/^\/uploads\/[0-9a-f-]+\.png$/)

    const served = await request(app).get(res.body.item.imageUrl)
    expect(served.status).toBe(200)
    expect(served.headers['content-type']).toContain('image/png')
  })

  it('rejects an unsupported file type', async () => {
    const { cookie, item } = await ownerContext()

    const res = await request(app)
      .post(`/api/items/${item.id}/image`)
      .set('Cookie', cookie)
      .attach('image', PNG_1x1, { filename: 'photo.txt', contentType: 'text/plain' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('INVALID_IMAGE_TYPE')
  })

  it('rejects files over 5MB', async () => {
    const { cookie, item } = await ownerContext()
    const oversized = Buffer.alloc(5 * 1024 * 1024 + 1)

    const res = await request(app)
      .post(`/api/items/${item.id}/image`)
      .set('Cookie', cookie)
      .attach('image', oversized, { filename: 'big.png', contentType: 'image/png' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('UPLOAD_ERROR')
  })

  it('requires an image file', async () => {
    const { cookie, item } = await ownerContext()

    const res = await request(app).post(`/api/items/${item.id}/image`).set('Cookie', cookie)

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('IMAGE_REQUIRED')
  })
})
