import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from '../src/lib/password'

describe('password hashing', () => {
  it('never stores the plaintext password', async () => {
    const hash = await hashPassword('correct-horse-battery')

    expect(hash).not.toContain('correct-horse-battery')
    expect(hash).toMatch(/^\$2[aby]\$\d+/)
  })

  it('verifies correct and rejects incorrect passwords', async () => {
    const hash = await hashPassword('correct-horse-battery')

    await expect(verifyPassword('correct-horse-battery', hash)).resolves.toBe(true)
    await expect(verifyPassword('wrong-password', hash)).resolves.toBe(false)
  })
})
