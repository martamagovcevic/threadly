import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app'
import { resetDb } from './helpers'

const app = createApp()

function sessionCookie(res: request.Response): string[] {
  const value = res.headers['set-cookie']
  return Array.isArray(value) ? value : value ? [value] : []
}

describe('POST /api/auth/register', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('registers a user and starts a session', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', name: 'Test User', password: 'password123' })

    expect(res.status).toBe(201)
    expect(res.body.user.email).toBe('user@example.com')
    expect(res.body.user.name).toBe('Test User')
    expect(res.body.user).not.toHaveProperty('password')
    expect(sessionCookie(res).join('')).toContain('threadly.sid')
  })

  it('rejects a duplicate email with 409', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', name: 'Test User', password: 'password123' })

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', name: 'Another', password: 'password123' })

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('EMAIL_TAKEN')
  })

  it('rejects invalid input with 400 and validation details', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', name: '', password: 'short' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(res.body.error.details.fieldErrors).toHaveProperty('email')
    expect(res.body.error.details.fieldErrors).toHaveProperty('password')
  })
})

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('logs in with valid credentials', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', name: 'Test User', password: 'password123' })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'USER@example.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe('user@example.com')
    expect(sessionCookie(res).join('')).toContain('threadly.sid')
  })

  it('rejects a wrong password with 401', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', name: 'Test User', password: 'password123' })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'wrong-password' })

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS')
  })
})

describe('GET /api/auth/me', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('returns the current user when authenticated', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', name: 'Test User', password: 'password123' })
    const cookie = sessionCookie(reg)

    const res = await request(app).get('/api/auth/me').set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe('user@example.com')
    expect(res.body.user).not.toHaveProperty('password')
  })

  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/auth/me')

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
  })
})

describe('POST /api/auth/logout', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('destroys the session and clears the cookie', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', name: 'Test User', password: 'password123' })
    const cookie = sessionCookie(reg)

    const logout = await request(app).post('/api/auth/logout').set('Cookie', cookie)
    expect(logout.status).toBe(204)

    const me = await request(app).get('/api/auth/me').set('Cookie', cookie)
    expect(me.status).toBe(401)
  })
})
