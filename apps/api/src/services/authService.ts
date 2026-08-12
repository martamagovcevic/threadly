import type { User } from '@prisma/client'
import type { LoginInput, RegisterInput } from '@threadly/shared'
import { prisma } from '../lib/prisma'
import { hashPassword, verifyPassword } from '../lib/password'

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export async function register(input: RegisterInput): Promise<User> {
  const email = input.email.toLowerCase()
  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    throw new AuthError('Email is already registered', 409, 'EMAIL_TAKEN')
  }

  return prisma.user.create({
    data: {
      email,
      name: input.name,
      password: await hashPassword(input.password),
    },
  })
}

export async function login(input: LoginInput): Promise<User> {
  const email = input.email.toLowerCase()
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    throw new AuthError('Invalid email or password', 401, 'INVALID_CREDENTIALS')
  }

  const passwordMatches = await verifyPassword(input.password, user.password)
  if (!passwordMatches) {
    throw new AuthError('Invalid email or password', 401, 'INVALID_CREDENTIALS')
  }

  return user
}
