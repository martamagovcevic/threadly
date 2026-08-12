import type { Request, Response } from 'express'
import type { LoginInput, RegisterInput } from '@threadly/shared'
import { toPublicUser } from '../lib/userSerializer'
import { login as loginUser, register as registerUser } from '../services/authService'

export async function register(req: Request, res: Response) {
  const user = await registerUser(req.body as RegisterInput)
  req.session.userId = user.id
  res.status(201).json({ user: toPublicUser(user) })
}

export async function login(req: Request, res: Response) {
  const user = await loginUser(req.body as LoginInput)
  req.session.userId = user.id
  res.json({ user: toPublicUser(user) })
}

export async function logout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) throw err
    res.clearCookie('threadly.sid')
    res.status(204).end()
  })
}

export function me(req: Request, res: Response) {
  res.json({ user: toPublicUser(res.locals.user) })
}
