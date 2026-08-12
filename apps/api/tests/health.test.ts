import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app'

describe('GET /api/health', () => {
  it('returns an ok status with uptime and timestamp', async () => {
    const res = await request(createApp()).get('/api/health')

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.uptime).toBeGreaterThan(0)
    expect(res.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})

describe('unknown routes', () => {
  it('returns a structured 404 error', async () => {
    const res = await request(createApp()).get('/api/does-not-exist')

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
    expect(res.body.error.message).toContain('GET /api/does-not-exist')
  })
})
