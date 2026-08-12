import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app'
import { createItem, createTestCatalog, resetDb } from './helpers'

const app = createApp()

describe('GET /api/items', () => {
  beforeEach(async () => {
    await resetDb()
    await createTestCatalog()
  })

  it('returns only visible items with seller info', async () => {
    const res = await request(app).get('/api/items')

    expect(res.status).toBe(200)
    expect(res.body.items).toHaveLength(3)
    for (const item of res.body.items) {
      expect(item).not.toHaveProperty('sellerId')
      expect(item.seller.name).toBe('Test User')
      expect(item).toHaveProperty('createdAt')
    }
    expect(res.body.pagination.total).toBe(3)
  })

  it('searches by name (case-insensitive)', async () => {
    const res = await request(app).get('/api/items').query({ search: 'vintage' })

    expect(res.status).toBe(200)
    expect(res.body.items.map((item: { name: string }) => item.name)).toEqual(['Vintage Jeans'])
  })

  it('filters by category and condition', async () => {
    const res = await request(app)
      .get('/api/items')
      .query({ category: 'DRESSES', condition: 'NEW' })

    expect(res.body.items).toHaveLength(1)
    expect(res.body.items[0].name).toBe('Floral Dress')
  })

  it('filters by price range', async () => {
    const res = await request(app).get('/api/items').query({ minPrice: 30, maxPrice: 100 })

    expect(res.status).toBe(200)
    expect(res.body.items.map((item: { name: string }) => item.name)).toEqual(['Vintage Jeans'])
  })

  it('sorts by price ascending', async () => {
    const res = await request(app).get('/api/items').query({ sort: 'price_asc' })

    expect(res.body.items.map((item: { price: number }) => item.price)).toEqual([25, 50, 150])
  })

  it('paginates', async () => {
    const res = await request(app).get('/api/items').query({ pageSize: 2, page: 1 })

    expect(res.body.items).toHaveLength(2)
    expect(res.body.pagination.page).toBe(1)
    expect(res.body.pagination.pageSize).toBe(2)
    expect(res.body.pagination.total).toBe(3)
    expect(res.body.pagination.totalPages).toBe(2)
  })

  it('rejects an invalid query with 400', async () => {
    const res = await request(app).get('/api/items').query({ page: 0 })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })
})

describe('GET /api/items/:id', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('returns a single visible item', async () => {
    const { denim } = await createTestCatalog()

    const res = await request(app).get(`/api/items/${denim.id}`)

    expect(res.status).toBe(200)
    expect(res.body.item.name).toBe('Vintage Jeans')
    expect(res.body.item.seller.name).toBe('Test User')
  })

  it('returns 404 for a sold or hidden item', async () => {
    const { seller } = await createTestCatalog()
    const soldItem = await createItem(seller.id, { name: 'Sold', sold: true })

    const res = await request(app).get(`/api/items/${soldItem.id}`)

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('ITEM_NOT_FOUND')
  })

  it('returns 404 for an unknown id', async () => {
    const res = await request(app).get('/api/items/does-not-exist')

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('ITEM_NOT_FOUND')
  })
})
