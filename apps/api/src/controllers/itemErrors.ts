import type { Response } from 'express'

export function itemNotFound(res: Response) {
  res.status(404).json({ error: { code: 'ITEM_NOT_FOUND', message: 'Item not found' } })
}

export function forbidden(res: Response, message: string) {
  res.status(403).json({ error: { code: 'FORBIDDEN', message } })
}
