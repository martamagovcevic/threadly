import type { NextFunction, Request, Response } from 'express'
import type { User } from '@prisma/client'
import { prisma } from '../lib/prisma'

function unauthorized(res: Response, message = 'Authentication required') {
  res.status(401).json({ error: { code: 'UNAUTHORIZED', message } })
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const userId = req.session.userId

  if (!userId) {
    unauthorized(res)
    return
  }

  void prisma.user
    .findUnique({ where: { id: userId } })
    .then((user) => {
      if (!user) {
        req.session.destroy(() => undefined)
        unauthorized(res)
        return
      }
      res.locals.user = user
      next()
    })
    .catch((err: unknown) => next(err))
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    const user = res.locals.user as User | undefined
    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } })
      return
    }
    next()
  })
}
