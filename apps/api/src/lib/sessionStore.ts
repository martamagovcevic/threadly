import type { PrismaClient } from '@prisma/client'
import session from 'express-session'

const DAYS = 24 * 60 * 60 * 1000

export function createPrismaSessionStore(prisma: PrismaClient): session.Store {
  class PrismaSessionStore extends session.Store {
    override get(
      sid: string,
      callback: (err: unknown, sessionData?: session.SessionData | null) => void,
    ): void {
      prisma.session
        .findUnique({ where: { id: sid } })
        .then(async (row) => {
          if (!row) {
            callback(null, null)
            return
          }
          if (row.expiresAt.getTime() < Date.now()) {
            await prisma.session.delete({ where: { id: sid } }).catch(() => undefined)
            callback(null, null)
            return
          }
          callback(null, JSON.parse(row.data) as session.SessionData)
        })
        .catch((err: unknown) => callback(err))
    }

    override set(sid: string, sess: session.SessionData, callback?: (err?: unknown) => void): void {
      const expiresAt = sess.cookie?.expires ?? new Date(Date.now() + DAYS)
      prisma.session
        .upsert({
          where: { id: sid },
          update: { data: JSON.stringify(sess), expiresAt },
          create: { id: sid, data: JSON.stringify(sess), expiresAt },
        })
        .then(() => callback?.())
        .catch((err: unknown) => callback?.(err))
    }

    override destroy(sid: string, callback?: (err?: unknown) => void): void {
      prisma.session
        .delete({ where: { id: sid } })
        .then(() => callback?.())
        .catch(() => callback?.())
    }

    override touch(
      sid: string,
      sess: session.SessionData,
      callback?: (err?: unknown) => void,
    ): void {
      this.set(sid, sess, callback)
    }
  }

  return new PrismaSessionStore()
}
