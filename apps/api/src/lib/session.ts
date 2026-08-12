import session from 'express-session'
import { env } from '../config/env'
import { prisma } from './prisma'
import { createPrismaSessionStore } from './sessionStore'

export const SESSION_COOKIE_NAME = 'threadly.sid'

export function createSessionMiddleware() {
  return session({
    name: SESSION_COOKIE_NAME,
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: createPrismaSessionStore(prisma),
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
}
