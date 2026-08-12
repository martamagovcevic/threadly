import type { User } from '@prisma/client'

export type PublicUser = Pick<User, 'id' | 'email' | 'name' | 'role' | 'createdAt'>

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  }
}
